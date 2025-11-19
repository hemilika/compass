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
};