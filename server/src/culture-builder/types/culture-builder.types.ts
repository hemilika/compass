export interface WeeklyContributor {
    userId: number;
    firstname: string;
    lastname: string;
    postCount: number;
    replyCount: number;
    totalUpvotes: number;
}

export interface TopPost {
    id: number;
    title: string;
    upvotes: number;
    replies: number;
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
    topPosts: TopPost[];
    totalUpvotes: number;
}
