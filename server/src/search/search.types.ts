import { SEARCH_CONFIG } from './search.config';

export type SearchDocumentType = 'post' | 'reply';

export interface SearchDocument {
    id: string;
    type: SearchDocumentType;

    buId?: number | null;
    threadId?: number | null;
    postId?: number | null;

    title?: string;
    text: string;

    score: number;
    createdAt: Date;
}

export function normalizeToken(token: string): string {
    token = token.toLowerCase().trim();

    token = token.replace(/[^a-z0-9]+/g, '');

    if (!token) return '';

    if (SEARCH_CONFIG.stopwords.has(token)) return '';

    if (token.endsWith('s') && token.length > 3) {
        token = token.slice(0, -1);
    }

    return token;
}

export function tokenize(text: string): string[] {
    return text
        .toLowerCase()
        .split(/\s+/)
        .map((t) => normalizeToken(t))
        .filter(Boolean);
}

export interface AiSearchSource {
    id: string;
    type: SearchDocumentType;
    postId: number;
    threadId: number | null;
    threadName: string | null;
    buId: number | null;
    buName: string | null;
    title?: string;
    snippet: string;
    url: string;
    authorName: string;
    upvoteCount: number;
    createdAt: Date;
    relevanceScore: number;
}

export interface AiSearchResponse {
    answer: string;
    sources: AiSearchSource[];
    suggestedFollowups: string[];
    metadata: {
        totalSources: number;
        modelUsed: string;
        queryProcessedAt: Date;
    };
}

