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
            .limit(10)
            .getRawMany();

        // Enrich with user data and replies
        const contributors: WeeklyContributor[] = [];

        for (const poster of topPosters) {
            const user = await this.usersRepo.findOne({
                where: { id: poster.userId },
                relations: ['bu'],
            });

            if (!user) continue;

            // Get reply count
            const replyCount = await this.repliesRepo.count({
                where: {
                    author_id: poster.userId,
                    created_at: MoreThan(startDate),
                },
            });

            // Get top post
            const topPost = await this.postsRepo.findOne({
                where: {
                    author_id: poster.userId,
                    created_at: MoreThan(startDate),
                },
                order: { upvote_count: 'DESC' },
            });

            // Get top reply
            const topReply = await this.repliesRepo.findOne({
                where: {
                    author_id: poster.userId,
                    created_at: MoreThan(startDate),
                },
                order: { upvote_count: 'DESC' },
            });

            contributors.push({
                userId: poster.userId,
                firstname: user.firstname || '',
                lastname: user.lastname || '',
                email: user.email,
                buName: user.bu?.name,
                postCount: parseInt(poster.postCount),
                replyCount,
                totalUpvotes: parseInt(poster.totalUpvotes || '0'),
                topPost: topPost ? {
                    id: topPost.id,
                    title: topPost.title,
                    upvotes: topPost.upvote_count || 0,
                } : undefined,
                topReply: topReply ? {
                    id: topReply.id,
                    content: topReply.content.substring(0, 100),
                    upvotes: topReply.upvote_count || 0,
                } : undefined,
            });
        }

        return contributors;
    }

    async getWeeklyAnalytics(): Promise<WeeklyAnalytics> {
        const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday
        const weekEnd = new Date();

        const [topContributors, totalPosts, totalReplies, activeUsers] = await Promise.all([
            this.getTopContributors(7),
            this.postsRepo.count({ where: { created_at: MoreThan(weekStart) } }),
            this.repliesRepo.count({ where: { created_at: MoreThan(weekStart) } }),
            this.postsRepo
                .createQueryBuilder('post')
                .select('COUNT(DISTINCT post.author_id)', 'count')
                .where('post.created_at >= :weekStart', { weekStart })
                .getRawOne(),
        ]);

        // Get active BUs
        const activeBuPosts = await this.postsRepo.find({
            where: {
                created_at: MoreThan(weekStart),
                bu_id: Not(IsNull()),
            },
            relations: ['bu'],
        });

        const activeBUs = [...new Set(activeBuPosts.map(p => p.bu?.name).filter(Boolean))];

        // Calculate total upvotes
        const totalUpvotesResult = await this.postsRepo
            .createQueryBuilder('post')
            .select('SUM(post.upvote_count)', 'total')
            .where('post.created_at >= :weekStart', { weekStart })
            .getRawOne();

        return {
            weekStart,
            weekEnd,
            topContributors,
            totalPosts,
            totalReplies,
            totalUpvotes: parseInt(totalUpvotesResult?.total || '0'),
            activeUsers: parseInt(activeUsers?.count || '0'),
            activeBUs,
            trendingTopics: [], // Can be extracted from post titles/content
        };
    }
}
