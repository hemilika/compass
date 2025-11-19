import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

import { Bu } from '../bu/bu.entity';
import { Thread } from '../threads/thread.entity';
import { Post } from '../posts/post.entity';
import { Reply } from '../replies/reply.entity';
import { User } from '../users/user.entity';
import { ThreadUser } from '../threads/thread-user.entity';

import { SearchDocument, tokenize, AiSearchResponse, AiSearchSource } from './search.types';
import { SEARCH_CONFIG } from './search.config';
import { AiSearchDto } from './dto/ai-search.dto';

type DocIndex = number;

interface SearchParams {
    query: string;
    type?: 'post' | 'reply';
    match?: 'or' | 'and' | 'exact';
    buId?: number;
    threadId?: number;
    sort?: 'relevance' | 'new' | 'top';
    page?: number;
    limit?: number;
}

@Injectable()
export class SearchService implements OnModuleInit {
    private documents: SearchDocument[] = [];
    private index = new Map<string, Set<DocIndex>>();
    private now = new Date();
    private openai: OpenAI;

    // fast lookup maps
    private buMap = new Map<number, Bu>();
    private threadMap = new Map<number, Thread>();

    constructor(
        @InjectRepository(Post)
        private readonly postsRepo: Repository<Post>,

        @InjectRepository(Reply)
        private readonly repliesRepo: Repository<Reply>,

        @InjectRepository(Thread)
        private readonly threadsRepo: Repository<Thread>,

        @InjectRepository(Bu)
        private readonly buRepo: Repository<Bu>,

        @InjectRepository(User)
        private readonly usersRepo: Repository<User>,

        @InjectRepository(ThreadUser)
        private readonly threadUsersRepo: Repository<ThreadUser>,

        private readonly configService: ConfigService,
    ) {
        const apiKey = this.configService.get<string>('OPENAI_API_KEY');
        if (apiKey) {
            this.openai = new OpenAI({ apiKey });
        }
    }

    async onModuleInit() {
        await this.buildDocumentsFromDB();
        this.buildIndex();
    }

    // ---------------------------
    // LOAD REAL DATA FROM DATABASE
    // ---------------------------
    private async buildDocumentsFromDB() {
        const posts = await this.postsRepo.find();
        const replies = await this.repliesRepo.find();
        const threads = await this.threadsRepo.find();
        const bus = await this.buRepo.find();

        // Store fast lookup maps
        threads.forEach(t => this.threadMap.set(t.id, t));
        bus.forEach(b => this.buMap.set(b.id, b));

        const docs: SearchDocument[] = [];

        // POSTS
        for (const post of posts) {
            docs.push({
                id: `post_${post.id}`,
                type: 'post',
                buId: post.bu_id ?? null,
                threadId: post.thread_id,
                postId: post.id,
                title: post.title,
                text: `${post.title} ${post.content}`,
                score: post.upvote_count ?? 0,
                createdAt: post.created_at,
            });
        }

        // REPLIES
        for (const reply of replies) {
            const parentPost = posts.find(p => p.id === reply.post_id);

            docs.push({
                id: `reply_${reply.id}`,
                type: 'reply',
                buId: parentPost?.bu_id ?? null,
                threadId: parentPost?.thread_id ?? null,
                postId: reply.post_id,
                title: undefined,
                text: reply.content,
                score: reply.upvote_count ?? 0,
                createdAt: reply.created_at,
            });
        }

        this.documents = docs;
    }

    // ---------------------------
    // BUILD INVERTED INDEX
    // ---------------------------
    private buildIndex() {
        this.index.clear();

        this.documents.forEach((doc, idx) => {
            const tokens = tokenize(doc.text);
            for (const token of new Set(tokens)) {
                if (!this.index.has(token)) this.index.set(token, new Set());
                this.index.get(token)!.add(idx);
            }
        });
    }

    // ---------------------------
    // SUPPORTING UTILITIES
    // ---------------------------
    private phraseMatch(text: string, query: string): boolean {
        return text.toLowerCase().includes(query.toLowerCase());
    }

    private proximityScore(text: string, terms: string[]): number {
        const words = text.toLowerCase().split(/\s+/);
        let bestDistance = Infinity;

        for (let i = 0; i < words.length; i++) {
            for (let j = i + 1; j < words.length; j++) {
                if (terms.includes(words[i]) && terms.includes(words[j])) {
                    bestDistance = Math.min(bestDistance, Math.abs(j - i));
                }
            }
        }

        return bestDistance < Infinity ? 1 / bestDistance : 0;
    }

    private generateSnippet(text: string, terms: string[]) {
        const lower = text.toLowerCase();
        let idx = 0;

        for (const t of terms) {
            const found = lower.indexOf(t);
            if (found !== -1) {
                idx = found;
                break;
            }
        }

        const start = Math.max(0, idx - SEARCH_CONFIG.snippetLength / 2);
        const snippet = text.slice(start, start + SEARCH_CONFIG.snippetLength);

        let highlighted = snippet;
        for (const t of terms) {
            const reg = new RegExp(t, 'gi');
            highlighted = highlighted.replace(reg, (m) => `<b>${m}</b>`);
        }

        return highlighted;
    }

    // ---------------------------
    // MAIN SEARCH LOGIC
    // ---------------------------
    search(params: SearchParams) {
        const {
            query,
            type,
            match = 'or',
            buId,
            threadId,
            sort = 'relevance',
            page = 1,
            limit = 20,
        } = params;

        if (!query.trim()) {
            return { total: 0, page, limit, results: [] };
        }

        if (match === 'exact') {
            return this.searchExact(query, params);
        }

        const terms = tokenize(query);
        if (terms.length === 0) {
            return { total: 0, page, limit, results: [] };
        }

        const candidateIndexes = new Set<DocIndex>();
        for (const term of terms) {
            const docs = this.index.get(term);
            if (docs) docs.forEach((idx) => candidateIndexes.add(idx));
        }

        const scored: { doc: SearchDocument; score: number }[] = [];

        for (const idx of candidateIndexes) {
            const doc = this.documents[idx];

            // Filters
            if (type && doc.type !== type) continue;
            if (buId && doc.buId !== buId) continue;
            if (threadId && doc.threadId !== threadId) continue;

            const textTokens = tokenize(doc.text);
            if (match === 'and') {
                const missing = terms.some((t) => !textTokens.includes(t));
                if (missing) continue;
            }

            let score = 0;

            // Frequency ranking
            for (const t of terms) {
                const titleFreq =
                    (doc.title?.toLowerCase().match(new RegExp(t, 'g')) || []).length;
                const bodyFreq =
                    (doc.text.toLowerCase().match(new RegExp(t, 'g')) || []).length -
                    titleFreq;

                score += titleFreq * SEARCH_CONFIG.titleWeight;
                score += bodyFreq * SEARCH_CONFIG.contentWeight;
            }

            if (this.phraseMatch(doc.text, query)) {
                score += SEARCH_CONFIG.phraseBoost;
            }

            score +=
                this.proximityScore(doc.text, terms) *
                SEARCH_CONFIG.proximityBoost;

            score += doc.score * SEARCH_CONFIG.upvoteBoost;

            const ageDays =
                (this.now.getTime() - doc.createdAt.getTime()) /
                (1000 * 60 * 60 * 24);
            score += Math.max(0, 5 - ageDays * SEARCH_CONFIG.recencyDecay);

            scored.push({ doc, score });
        }

        // Sorting
        scored.sort((a, b) => {
            if (sort === 'new')
                return b.doc.createdAt.getTime() - a.doc.createdAt.getTime();
            if (sort === 'top')
                return b.doc.score - a.doc.score;
            return b.score - a.score;
        });

        // Pagination
        const start = (page - 1) * limit;
        const list = scored.slice(start, start + limit);

        // Enrichment
        const results = list.map(({ doc, score }) => {
            const thread = doc.threadId ? this.threadMap.get(doc.threadId) : null;
            const bu = doc.buId ? this.buMap.get(doc.buId) : null;

            return {
                id: doc.id,
                type: doc.type,
                buId: doc.buId,
                threadId: doc.threadId,
                threadName: thread?.name || null,
                buName: bu?.name || null,
                postId: doc.postId,
                title: doc.title,
                createdAt: doc.createdAt,
                score: doc.score,
                relevance: score,
                snippet: this.generateSnippet(doc.text, terms),
            };
        });

        return {
            total: scored.length,
            page,
            limit,
            results,
        };
    }

    // ---------------------------
    // EXACT PHRASE SEARCH
    // ---------------------------
    private searchExact(query: string, params: SearchParams) {
        const { type, buId, threadId, page = 1, limit = 20 } = params;

        const results = this.documents
            .filter((doc) => {
                if (type && doc.type !== type) return false;
                if (buId && doc.buId !== buId) return false;
                if (threadId && doc.threadId !== threadId) return false;
                return doc.text.toLowerCase().includes(query.toLowerCase());
            })
            .map((doc) => ({
                ...doc,
                snippet: this.generateSnippet(doc.text, [query]),
            }));

        const total = results.length;
        const start = (page - 1) * limit;

        return {
            total,
            page,
            limit,
            results: results.slice(start, start + limit),
        };
    }

    // ---------------------------
    // INDEX STATS
    // ---------------------------
    stats() {
        return {
            documentsIndexed: this.documents.length,
            termsIndexed: this.index.size,
            bus: this.buMap.size,
            threads: this.threadMap.size,
            posts: this.documents.filter(d => d.type === 'post').length,
            replies: this.documents.filter(d => d.type === 'reply').length,
        };
    }

    // ---------------------------
    // AI-POWERED SEARCH
    // ---------------------------
    async aiSearch(dto: AiSearchDto, userId: number): Promise<AiSearchResponse> {
        if (!this.openai) {
            throw new Error('OpenAI API key not configured');
        }

        // Get user's accessible threads
        const userThreads = await this.threadUsersRepo.find({
            where: { user_id: userId },
            select: ['thread_id'],
        });
        const accessibleThreadIds = new Set(userThreads.map(ut => ut.thread_id));

        // Pre-filter documents using traditional search
        const preSearchResults = this.search({
            query: dto.query,
            buId: dto.buId ? Number(dto.buId) : undefined,
            threadId: dto.threadId ? Number(dto.threadId) : undefined,
            limit: SEARCH_CONFIG.ai.maxContextDocuments,
        });

        // Filter by user's accessible threads
        const accessibleDocs = preSearchResults.results.filter(result => {
            if (!result.threadId) return false;
            return accessibleThreadIds.has(result.threadId);
        });

        if (accessibleDocs.length === 0) {
            return {
                answer: "I couldn't find any relevant posts or replies in the threads you have access to. Try refining your search query or check if you have access to the relevant threads.",
                sources: [],
                suggestedFollowups: [
                    "What threads am I subscribed to?",
                    "Show me recent posts",
                    "What's trending today?"
                ],
                metadata: {
                    totalSources: 0,
                    modelUsed: this.configService.get('OPENAI_MODEL', 'gpt-4o'),
                    queryProcessedAt: new Date(),
                },
            };
        }

        // Get full post and reply details for AI context
        const posts = await this.postsRepo.find({
            where: {
                id: In(accessibleDocs
                    .filter(d => d.type === 'post')
                    .map(d => d.postId)),
            },
            relations: ['author', 'thread', 'bu'],
        });

        const replies = await this.repliesRepo.find({
            where: {
                id: In(accessibleDocs
                    .filter(d => d.type === 'reply')
                    .map(d => Number(d.id.replace('reply_', '')))),
            },
            relations: ['author', 'post', 'post.thread', 'post.bu'],
        });

        // Build context for OpenAI
        const contextDocs = [
            ...posts.map(p => ({
                id: `post_${p.id}`,
                type: 'post' as const,
                title: p.title,
                content: p.content,
                author: `${p.author.firstname || ''} ${p.author.lastname || ''}`.trim() || p.author.email,
                threadName: p.thread?.name,
                buName: p.bu?.name,
                upvotes: p.upvote_count,
                createdAt: p.created_at,
            })),
            ...replies.map(r => ({
                id: `reply_${r.id}`,
                type: 'reply' as const,
                content: r.content,
                author: `${r.author.firstname || ''} ${r.author.lastname || ''}`.trim() || r.author.email,
                threadName: r.post?.thread?.name,
                buName: r.post?.bu?.name,
                upvotes: r.upvote_count,
                createdAt: r.created_at,
                postTitle: r.post?.title,
            })),
        ];

        // Build conversation messages
        const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
            {
                role: 'system',
                content: this.buildSystemPrompt(contextDocs),
            },
        ];

        // Add conversation history if provided
        if (dto.conversationHistory && dto.conversationHistory.length > 0) {
            dto.conversationHistory.forEach(msg => {
                messages.push({
                    role: msg.role as 'user' | 'assistant',
                    content: msg.content,
                });
            });
        }

        messages.push({
            role: 'user',
            content: dto.query,
        });

        // Call OpenAI
        const completion = await this.openai.chat.completions.create({
            model: this.configService.get('OPENAI_MODEL', 'gpt-5-nano'),
            messages,
            functions: [
                {
                    name: 'format_search_results',
                    description: 'Format the search results with answer and relevant source IDs',
                    parameters: {
                        type: 'object',
                        properties: {
                            answer: {
                                type: 'string',
                                description: 'A helpful answer with HTML anchor tags linking to posts/replies. Use format: <a href="/posts/{id}" class="post-link">{Title}</a>',
                            },
                            relevantSourceIds: {
                                type: 'array',
                                items: { type: 'string' },
                                description: 'Array of document IDs (e.g., "post_123", "reply_456") that are cited in the answer',
                            },
                            suggestedFollowups: {
                                type: 'array',
                                items: { type: 'string' },
                                description: 'Array of 2-3 suggested follow-up questions',
                            },
                        },
                        required: ['answer', 'relevantSourceIds', 'suggestedFollowups'],
                    },
                },
            ],
            function_call: { name: 'format_search_results' },
        });

        // Parse OpenAI response
        const functionCall = completion.choices[0].message.function_call;
        const result = functionCall ? JSON.parse(functionCall.arguments) : null;

        if (!result) {
            throw new Error('Failed to parse OpenAI response');
        }

        // Map source IDs to full source objects
        const sources: AiSearchSource[] = [];

        for (const sourceId of result.relevantSourceIds || []) {
            if (sourceId.startsWith('post_')) {
                const postId = Number(sourceId.replace('post_', ''));
                const post = posts.find(p => p.id === postId);
                if (post) {
                    sources.push({
                        id: sourceId,
                        type: 'post',
                        postId: post.id,
                        threadId: post.thread_id,
                        threadName: post.thread?.name || null,
                        buId: post.bu_id,
                        buName: post.bu?.name || null,
                        title: post.title,
                        snippet: this.truncateText(post.content, SEARCH_CONFIG.ai.includeSnippetLength),
                        url: `/posts/${post.id}`,
                        authorName: `${post.author.firstname || ''} ${post.author.lastname || ''}`.trim() || post.author.email,
                        upvoteCount: post.upvote_count || 0,
                        createdAt: post.created_at,
                        relevanceScore: 1.0,
                    });
                }
            } else if (sourceId.startsWith('reply_')) {
                const replyId = Number(sourceId.replace('reply_', ''));
                const reply = replies.find(r => r.id === replyId);
                if (reply) {
                    sources.push({
                        id: sourceId,
                        type: 'reply',
                        postId: reply.post_id,
                        threadId: reply.post?.thread_id || null,
                        threadName: reply.post?.thread?.name || null,
                        buId: reply.post?.bu_id || null,
                        buName: reply.post?.bu?.name || null,
                        title: reply.post?.title,
                        snippet: this.truncateText(reply.content, SEARCH_CONFIG.ai.includeSnippetLength),
                        url: `/posts/${reply.post_id}#reply-${reply.id}`,
                        authorName: `${reply.author.firstname || ''} ${reply.author.lastname || ''}`.trim() || reply.author.email,
                        upvoteCount: reply.upvote_count || 0,
                        createdAt: reply.created_at,
                        relevanceScore: 1.0,
                    });
                }
            }
        }

        return {
            answer: result.answer,
            sources,
            suggestedFollowups: result.suggestedFollowups || [],
            metadata: {
                totalSources: sources.length,
                modelUsed: this.configService.get('OPENAI_MODEL', 'gpt-4o'),
                queryProcessedAt: new Date(),
            },
        };
    }

    private buildSystemPrompt(contextDocs: any[]): string {
        const docsContext = contextDocs.map((doc, idx) => {
            if (doc.type === 'post') {
                return `[${idx + 1}] ID: ${doc.id}
Type: Post
Title: ${doc.title}
Content: ${doc.content}
Author: ${doc.author}
Thread: ${doc.threadName || 'N/A'}
BU: ${doc.buName || 'N/A'}
Upvotes: ${doc.upvotes}
Created: ${doc.createdAt}`;
            } else {
                return `[${idx + 1}] ID: ${doc.id}
Type: Reply
Post Title: ${doc.postTitle || 'N/A'}
Content: ${doc.content}
Author: ${doc.author}
Thread: ${doc.threadName || 'N/A'}
BU: ${doc.buName || 'N/A'}
Upvotes: ${doc.upvotes}
Created: ${doc.createdAt}`;
            }
        }).join('\n\n---\n\n');

        return `You are a helpful search assistant for Compass, an internal knowledge-sharing platform. Your role is to help users find relevant posts and replies based on their questions.

AVAILABLE DOCUMENTS:
${docsContext}

INSTRUCTIONS:
1. Analyze the user's query and identify the most relevant documents from the list above
2. Provide a clear, concise answer that synthesizes information from relevant sources
3. IMPORTANT: Reference posts using HTML anchor tags with this exact format: <a href="/posts/{post_id}" class="post-link" data-post-id="{post_id}">{Post Title}</a>
4. IMPORTANT: Reference replies using: <a href="/posts/{post_id}#reply-{reply_id}" class="reply-link" data-reply-id="{reply_id}">this reply</a>
5. Example: "Check out <a href="/posts/4" class="post-link" data-post-id="4">Vue 3 vs React - Your opinion?</a> for framework comparisons."
6. If the query cannot be answered with the available documents, say so clearly
7. Suggest 2-3 relevant follow-up questions the user might ask
8. Be conversational and helpful, but stay focused on the available content
9. When multiple documents are relevant, mention the most important ones first
10. Always use HTML links when mentioning posts or replies so the frontend can render them as clickable links

Use the format_search_results function to structure your response.`;
    }

    private truncateText(text: string, maxLength: number): string {
        if (text.length <= maxLength) return text;
        return text.slice(0, maxLength) + '...';
    }
}
