import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { Bu } from '../bu/bu.entity';
import { Thread } from '../threads/thread.entity';
import { Post } from '../posts/post.entity';
import { Reply } from '../replies/reply.entity';

import { SearchDocument, tokenize } from './search.types';
import { SEARCH_CONFIG } from './search.config';

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
    ) { }

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
}
