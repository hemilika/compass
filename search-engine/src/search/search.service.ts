import { Injectable, OnModuleInit } from '@nestjs/common';
import { CATEGORIES, POSTS, MESSAGES } from '../domain/sample-data';
import { SearchDocument, SearchDocumentType, tokenize } from './search.types';

type DocIndex = number;

@Injectable()
export class SearchService implements OnModuleInit {
    private documents: SearchDocument[] = [];
    private invertedIndex = new Map<string, Set<DocIndex>>();

    onModuleInit() {
        this.buildDocuments();
        this.buildIndex();
    }

    private buildDocuments() {
        const docs: SearchDocument[] = [];

        for (const post of POSTS) {
            docs.push({
                id: post.id,
                type: 'post',
                categoryId: post.categoryId,
                postId: post.id,
                title: post.title,
                text: `${post.title} ${post.body}`,
                score: post.score,
                createdAt: post.createdAt,
            });
        }

        for (const msg of MESSAGES) {
            const parentPost = POSTS.find((p) => p.id === msg.postId);
            docs.push({
                id: msg.id,
                type: 'message',
                categoryId: parentPost?.categoryId,
                postId: msg.postId,
                text: msg.body,
                score: parentPost?.score ?? 0,
                createdAt: msg.createdAt,
            });
        }

        this.documents = docs;
    }

    private buildIndex() {
        this.invertedIndex.clear();

        this.documents.forEach((doc, idx) => {
            const tokens = tokenize(doc.text);

            for (const token of new Set(tokens)) {
                if (!this.invertedIndex.has(token)) {
                    this.invertedIndex.set(token, new Set());
                }
                this.invertedIndex.get(token)!.add(idx);
            }
        });
    }


    search(params: {
        query: string;
        type?: SearchDocumentType;
        categoryId?: string;
        limit?: number;
    }) {
        const { query, type, categoryId, limit = 20 } = params;

        const terms = tokenize(query);
        if (terms.length === 0) {
            return [];
        }

        const candidateIndexes = new Set<DocIndex>();
        for (const term of terms) {
            const docsForTerm = this.invertedIndex.get(term);
            if (!docsForTerm) continue;
            docsForTerm.forEach((idx) => candidateIndexes.add(idx));
        }

        const results = [] as {
            doc: SearchDocument;
            score: number;
            matchedTerms: string[];
        }[];

        for (const idx of candidateIndexes) {
            const doc = this.documents[idx];

            if (type && doc.type !== type) continue;
            if (categoryId && doc.categoryId !== categoryId) continue;

            const docTokens = tokenize(doc.text);
            let termMatches = 0;

            for (const t of terms) {
                termMatches += docTokens.filter((dt) => dt === t).length;
            }

            if (termMatches === 0) continue;

            const relevanceScore = termMatches + doc.score * 0.1;

            results.push({
                doc,
                score: relevanceScore,
                matchedTerms: terms.filter((t) => docTokens.includes(t)),
            });
        }

        results.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return b.doc.createdAt.getTime() - a.doc.createdAt.getTime();
        });

        return results.slice(0, limit).map((r) => r.doc);
    }

    getIndexedDocuments() {
        return this.documents;
    }

    getCategories() {
        return CATEGORIES;
    }

    getPosts() {
        return POSTS;
    }
}
