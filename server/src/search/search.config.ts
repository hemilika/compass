export const SEARCH_CONFIG = {
    titleWeight: 3,
    contentWeight: 1,
    upvoteBoost: 0.1,
    recencyDecay: 0.05,
    phraseBoost: 12,
    proximityBoost: 6,
    snippetLength: 180,
    stopwords: new Set([
        'the', 'and', 'or', 'in', 'on', 'to', 'of', 'for',
        'a', 'an', 'is', 'it', 'with', 'as', 'at'
    ]),
    ai: {
        maxContextDocuments: 20,
        responseMaxLength: 500,
        includeSnippetLength: 150,
        suggestedFollowupsCount: 3,
        rateLimit: {
            requestsPerHour: 20,
            requestsPerDay: 100,
        },
    },
};