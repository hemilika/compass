// src/search/search.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { BUS, THREADS, POSTS, REPLIES } from '../domain/sample-data';
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

    onModuleInit() {
        this.buildDocuments();
        this.buildIndex();
    }

    private buildDocuments() {
        const docs: SearchDocument[] = [];

        // POSTS
        for (const post of POSTS) {
            docs.push({
                id: `post_${post.id}`,
                type: 'post',
                buId: post.buId,
                threadId: post.threadId,
                postId: post.id,
                title: post.title,
                text: `${post.title} ${post.content}`,
                score: post.upvoteCount,
                createdAt: post.createdAt,
            });
        }

        // REPLIES
        for (const reply of REPLIES) {
            const parent = POSTS.find((p) => p.id === reply.postId);
            docs.push({
                id: `reply_${reply.id}`,
                type: 'reply',
                buId: parent?.buId ?? null,
                threadId: parent?.threadId ?? null,
                postId: reply.postId,
                text: reply.content,
                score: reply.upvoteCount,
                createdAt: reply.createdAt,
            });
        }

        this.documents = docs;
    }

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

        // highlight
        let highlighted = snippet;
        for (const t of terms) {
            const reg = new RegExp(t, 'gi');
            highlighted = highlighted.replace(reg, (m) => `<b>${m}</b>`);
        }

        return highlighted;
    }

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

        // EXACT PHRASE SEARCH
        if (match === 'exact') {
            return this.searchExact(query, params);
        }

        const terms = tokenize(query);
        if (terms.length === 0) {
            return { total: 0, page, limit, results: [] };
        }

        // OR / AND candidate collection
        const candidateIndexes = new Set<DocIndex>();

        for (const term of terms) {
            const docs = this.index.get(term);
            if (docs) docs.forEach((idx) => candidateIndexes.add(idx));
        }

        const scored: { doc: SearchDocument; score: number }[] = [];

        for (const idx of candidateIndexes) {
            const doc = this.documents[idx];

            if (type && doc.type !== type) continue;
            if (buId && doc.buId !== buId) continue;
            if (threadId && doc.threadId !== threadId) continue;

            const textTokens = tokenize(doc.text);

            // AND-mode requires all terms present
            if (match === 'and') {
                const missing = terms.some((t) => !textTokens.includes(t));
                if (missing) continue;
            }

            let score = 0;

            // frequency scoring
            for (const t of terms) {
                const titleFreq =
                    (doc.title?.toLowerCase().match(new RegExp(t, 'g')) || []).length;
                const bodyFreq =
                    (doc.text.toLowerCase().match(new RegExp(t, 'g')) || []).length -
                    titleFreq;

                score += titleFreq * SEARCH_CONFIG.titleWeight;
                score += bodyFreq * SEARCH_CONFIG.contentWeight;
            }

            // phrase boost
            if (this.phraseMatch(doc.text, query)) {
                score += SEARCH_CONFIG.phraseBoost;
            }

            // proximity boost
            score +=
                this.proximityScore(doc.text, terms) *
                SEARCH_CONFIG.proximityBoost;

            // upvote boost
            score += doc.score * SEARCH_CONFIG.upvoteBoost;

            // recency boost
            const ageDays =
                (this.now.getTime() - doc.createdAt.getTime()) /
                (1000 * 60 * 60 * 24);
            score += Math.max(0, 5 - ageDays * SEARCH_CONFIG.recencyDecay);

            scored.push({ doc, score });
        }

        // sorting
        scored.sort((a, b) => {
            if (sort === 'new')
                return b.doc.createdAt.getTime() - a.doc.createdAt.getTime();

            if (sort === 'top')
                return b.doc.score - a.doc.score;

            return b.score - a.score;
        });

        // pagination
        const start = (page - 1) * limit;
        const list = scored.slice(start, start + limit);

        // enrich + snippet
        const results = list.map(({ doc, score }) => {
            const thread = THREADS.find((t) => t.id === doc.threadId);
            const bu = BUS.find((b) => b.id === doc.buId);

            return {
                id: doc.id,
                type: doc.type,
                buId: doc.buId,
                threadId: doc.threadId,
                threadName: thread?.name,
                buName: bu?.name,
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

    stats() {
        return {
            documentsIndexed: this.documents.length,
            termsIndexed: this.index.size,
            threads: THREADS.length,
            bus: BUS.length,
            posts: POSTS.length,
            replies: REPLIES.length,
        };
    }
}
