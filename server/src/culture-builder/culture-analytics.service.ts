import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, Not, IsNull } from 'typeorm';
import { Post } from '../posts/post.entity';
import { Reply } from '../replies/reply.entity';
import { User } from '../users/user.entity';
import { Bu } from '../bu/bu.entity';
import { startOfWeek, subDays, format } from 'date-fns';
import { WeeklyContributor, WeeklyAnalytics } from './types/culture-builder.types';

@Injectable()
export class CultureAnalyticsService {
    private readonly logger = new Logger(CultureAnalyticsService.name);

    constructor(
        @InjectRepository(Post)
        private readonly postsRepo: Repository<Post>,
        @InjectRepository(Reply)
        private readonly repliesRepo: Repository<Reply>,
        @InjectRepository(User)
        private readonly usersRepo: Repository<User>,
        @InjectRepository(Bu)
        private readonly buRepo: Repository<Bu>,
    ) { }

    async getTopContributors(days: number = 7): Promise<WeeklyContributor[]> {
        const startDate = subDays(new Date(), days);

        // Get top posters
        const topPosters = await this.postsRepo
            .createQueryBuilder('post')
            .select('post.author_id', 'userId')
            .addSelect('COUNT(*)', 'postCount')
            .addSelect('SUM(post.upvote_count)', 'totalUpvotes')
            .where('post.created_at >= :startDate', { startDate })
            .groupBy('post.author_id')
            .orderBy('"postCount"', 'DESC')
            .limit(3)
            .getRawMany();

        // Enrich with user data and replies
        const contributors: WeeklyContributor[] = [];

        for (const poster of topPosters) {
            const user = await this.usersRepo.findOne({
                where: { id: poster.userId },
            });

            if (!user) continue;

            // Get reply count
            const replyCount = await this.repliesRepo.count({
                where: {
                    author_id: poster.userId,
                    created_at: MoreThan(startDate),
                },
            });

            contributors.push({
                userId: poster.userId,
                firstname: user.firstname || '',
                lastname: user.lastname || '',
                postCount: parseInt(poster.postCount),
                replyCount,
                totalUpvotes: parseInt(poster.totalUpvotes || '0'),
            });
        }

        return contributors;
    }

    async getWeeklyAnalytics(): Promise<WeeklyAnalytics> {
        const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday

        const [topPostsData, totalUpvotesResult] = await Promise.all([
            // Get top 3 posts
            this.postsRepo
                .createQueryBuilder('post')
                .select(['post.id', 'post.title', 'post.upvote_count'])
                .addSelect('COUNT(reply.id)', 'replyCount')
                .leftJoin('post.replies', 'reply')
                .where('post.created_at >= :weekStart', { weekStart })
                .groupBy('post.id')
                .orderBy('post.upvote_count', 'DESC')
                .limit(3)
                .getRawMany(),
            // Total upvotes
            this.postsRepo
                .createQueryBuilder('post')
                .select('SUM(post.upvote_count)', 'total')
                .where('post.created_at >= :weekStart', { weekStart })
                .getRawOne(),
        ]);

        // Format top posts
        const topPosts = topPostsData.map(post => ({
            id: post.post_id,
            title: post.post_title,
            upvotes: parseInt(post.post_upvote_count || '0'),
            replies: parseInt(post.replyCount || '0'),
        }));

        return {
            topPosts,
            totalUpvotes: parseInt(totalUpvotesResult?.total || '0'),
        };
    }
}
