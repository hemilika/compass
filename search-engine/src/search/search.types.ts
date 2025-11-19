export type SearchDocumentType = 'post' | 'message';

export interface SearchDocument {
    id: string;
    type: SearchDocumentType;

    categoryId?: string;
    postId?: string;

    title?: string;
    text: string;
    score: number;
    createdAt: Date;
}

export function tokenize(text: string): string[] {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .split(' ')
        .filter(Boolean);
}
