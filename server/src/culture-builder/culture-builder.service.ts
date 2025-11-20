import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { format, startOfWeek } from 'date-fns';
import { CultureAnalyticsService } from './culture-analytics.service';
import { CultureAiService } from './culture-ai.service';
import { AppreciationThread } from './entities/appreciation-thread.entity';
import { Challenge } from './entities/challenge.entity';
import { Post } from '../posts/post.entity';
import { Thread } from '../threads/thread.entity';
import { User } from '../users/user.entity';
import { ChallengeData } from './types/culture-builder.types';

@Injectable()
export class CultureBuilderService {
    private readonly logger = new Logger(CultureBuilderService.name);
    private readonly CULTURE_THREAD_NAME = '🌟 Weekly Appreciation';
    private readonly CHALLENGE_THREAD_NAME = '🎯 Community Challenges';
    private readonly SYSTEM_USER_EMAIL = 'admin@compass.com'; // Using admin as system user

    constructor(
        @InjectRepository(AppreciationThread)
        private readonly appreciationRepo: Repository<AppreciationThread>,
        @InjectRepository(Challenge)
        private readonly challengeRepo: Repository<Challenge>,
        @InjectRepository(Post)
        private readonly postRepo: Repository<Post>,
        @InjectRepository(Thread)
        private readonly threadRepo: Repository<Thread>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        private readonly analyticsService: CultureAnalyticsService,
        private readonly aiService: CultureAiService,
    ) { }

    async generateWeeklyAppreciationThread(): Promise<Post> {
        this.logger.log('Generating weekly appreciation thread...');

        // Get analytics
        const contributors = await this.analyticsService.getTopContributors(7);

        if (contributors.length === 0) {
            this.logger.warn('No contributors found for appreciation thread');
            throw new Error('No contributors to appreciate');
        }

        // Generate AI content
        const content = await this.aiService.generateAppreciationContent(contributors);

        // Get system user and thread
        const systemUser = await this.getSystemUser();
        const thread = await this.getOrCreateThread(this.CULTURE_THREAD_NAME, 'Celebrating our community');

        // Create post
        const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
        const post = this.postRepo.create({
            thread_id: thread.id,
            bu_id: undefined, // Cross-BU
            author_id: systemUser.id,
            title: `🤖 🌟 Weekly Recognition - Week of ${format(weekStart, 'MMM dd, yyyy')}`,
            content: content,
            icon_url: '🌟',
            image_urls: [],
            upvote_count: 0,
        });

        const savedPost = await this.postRepo.save(post);

        // Track in appreciation_threads table
        const appreciationThread = this.appreciationRepo.create({
            generated_post_id: savedPost.id,
            week_start_date: format(weekStart, 'yyyy-MM-dd'),
            contributors_data: contributors,
            generation_status: 'generated',
            is_ai_generated: true,
        });

        await this.appreciationRepo.save(appreciationThread);

        this.logger.log(`Created appreciation thread post ID: ${savedPost.id}`);
        return savedPost;
    }

    async generateWeeklyChallenge(): Promise<Post> {
        this.logger.log('Generating weekly challenge...');

        // Determine challenge type based on recent activity
        const analytics = await this.analyticsService.getWeeklyAnalytics();
        const challengeType = this.determineChallengeType(analytics);

        const challengeData: ChallengeData = this.createChallengeData(challengeType, analytics);

        // Generate AI content
        const content = await this.aiService.generateChallengeContent(challengeData);

        // Get system user and thread
        const systemUser = await this.getSystemUser();
        const thread = await this.getOrCreateThread(this.CHALLENGE_THREAD_NAME, 'Engage with challenges');

        // Create post
        const post = this.postRepo.create({
            thread_id: thread.id,
            bu_id: undefined,
            author_id: systemUser.id,
            title: `🤖 ${challengeData.title}`,
            content: content,
            icon_url: '🎯',
            image_urls: [],
            upvote_count: 0,
        });

        const savedPost = await this.postRepo.save(post);

        // Track in challenges table
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 7); // 7-day challenge

        const challenge = this.challengeRepo.create({
            title: challengeData.title,
            description: challengeData.description,
            challenge_type: challengeData.type,
            thread_id: thread.id,
            post_id: savedPost.id,
            start_date: new Date(),
            end_date: endDate,
            status: 'active',
            is_ai_generated: true,
        });

        await this.challengeRepo.save(challenge);

        this.logger.log(`Created challenge post ID: ${savedPost.id}`);
        return savedPost;
    }

    async deactivatePreviousChallenges(): Promise<void> {
        this.logger.log('Deactivating previous active challenges...');

        const activeChallenges = await this.challengeRepo.find({
            where: { status: 'active' },
        });

        if (activeChallenges.length > 0) {
            for (const challenge of activeChallenges) {
                challenge.status = 'completed';
            }
            await this.challengeRepo.save(activeChallenges);
            this.logger.log(`Deactivated ${activeChallenges.length} previous challenge(s)`);
        }
    }

    private async getSystemUser(): Promise<User> {
        let systemUser = await this.userRepo.findOne({
            where: { email: this.SYSTEM_USER_EMAIL },
        });

        if (!systemUser) {
            // Fallback to first admin user
            systemUser = await this.userRepo.findOne({
                where: { roles: ['admin'] } as any,
            });

            if (!systemUser) {
                throw new Error('No system user or admin user found');
            }
        }

        return systemUser;
    }

    private async getOrCreateThread(name: string, description: string): Promise<Thread> {
        let thread = await this.threadRepo.findOne({
            where: { name },
        });

        if (!thread) {
            thread = this.threadRepo.create({
                name,
                description,
                bu_id: undefined, // Cross-BU thread
            });
            thread = await this.threadRepo.save(thread);
            this.logger.log(`Created new thread: ${name}`);
        }

        return thread;
    }

    private determineChallengeType(analytics: any): ChallengeData['type'] {
        // Simple logic to vary challenge types
        const week = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
        const types: ChallengeData['type'][] = ['engagement', 'cross-bu', 'mentorship', 'knowledge-share'];
        return types[week % types.length];
    }

    private createChallengeData(type: ChallengeData['type'], analytics: any): ChallengeData {
        const challenges = {
            'engagement': {
                title: '💬 Engagement Challenge: Share Your Expertise',
                description: 'This week, challenge yourself to reply to at least 3 posts outside your usual topics. Help someone learn something new!',
            },
            'cross-bu': {
                title: '🌉 Cross-BU Collaboration Week',
                description: `Connect with someone from a different business unit this week. We have ${analytics.activeBUs.length} active BUs - explore and collaborate!`,
            },
            'mentorship': {
                title: '🎓 Mentorship Moments',
                description: 'Share a lesson you learned this week or mentor someone by answering their questions. Knowledge grows when shared!',
            },
            'knowledge-share': {
                title: '📚 Knowledge Sharing Sprint',
                description: 'Document something you know well! Write a post about a tool, technique, or insight that could help others.',
            },
        };

        return { type, ...challenges[type] };
    }

    // Manual generation methods for admin/testing
    async manualGenerateAppreciation(days: number = 7): Promise<Post> {
        return this.generateWeeklyAppreciationThread();
    }

    async manualGenerateChallenge(type?: ChallengeData['type']): Promise<Post> {
        return this.generateWeeklyChallenge();
    }

    // Public methods for users to fetch challenges
    async getActiveChallenges() {
        return await this.challengeRepo.find({
            where: { status: 'active' },
            order: { created_at: 'DESC' },
        });
    }

    async getRecentChallenges(limit: number = 5) {
        return await this.challengeRepo.find({
            order: { created_at: 'DESC' },
            take: limit,
        });
    }
}
