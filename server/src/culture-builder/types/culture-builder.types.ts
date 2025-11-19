export interface WeeklyContributor {
    userId: number;
    firstname: string;
    lastname: string;
    email: string;
    buName?: string;
    postCount: number;
    replyCount: number;
    totalUpvotes: number;
    topPost?: {
        id: number;
        title: string;
        upvotes: number;
    };
    topReply?: {
        id: number;
        content: string;
        upvotes: number;
    };
}

export interface ChallengeData {
    type: 'engagement' | 'cross-bu' | 'mentorship' | 'knowledge-share';
    title: string;
    description: string;
    targetMetric?: string;
    currentValue?: number;
    targetValue?: number;
}

export interface WeeklyAnalytics {
    weekStart: Date;
    weekEnd: Date;
    topContributors: WeeklyContributor[];
    totalPosts: number;
    totalReplies: number;
    totalUpvotes: number;
    activeUsers: number;
    activeBUs: string[];
    trendingTopics: string[];
}
