import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CultureBuilderService } from './culture-builder.service';

@Injectable()
export class CultureSchedulerService {
    private readonly logger = new Logger(CultureSchedulerService.name);

    constructor(
        private readonly cultureBuilder: CultureBuilderService,
    ) { }

    // Every Monday at 9:00 AM (Rome time)
    @Cron('0 9 * * 1', {
        name: 'weekly-appreciation',
        timeZone: 'Europe/Rome',
    })
    async generateWeeklyAppreciation() {
        this.logger.log('🌟 Starting weekly appreciation thread generation...');
        try {
            const post = await this.cultureBuilder.generateWeeklyAppreciationThread();
            this.logger.log(`✅ Created appreciation thread: Post ID ${post.id}`);
        } catch (error) {
            this.logger.error('❌ Failed to generate appreciation thread', error.stack);
        }
    }

    // Every Wednesday at 10:00 AM (Rome time) - Generate weekly challenge
    @Cron('0 10 * * 3', {
        name: 'weekly-challenge',
        timeZone: 'Europe/Rome',
    })
    async generateWeeklyChallenge() {
        this.logger.log('🎯 Starting weekly challenge generation...');
        try {
            // Deactivate previous active challenges
            await this.cultureBuilder.deactivatePreviousChallenges();
            // Generate new challenge
            const post = await this.cultureBuilder.generateWeeklyChallenge();
            this.logger.log(`✅ Created challenge: Post ID ${post.id}`);
        } catch (error) {
            this.logger.error('❌ Failed to generate challenge', error.stack);
        }
    }

    // Manual trigger for testing (can be removed in production)
    async triggerWeeklyAppreciation() {
        this.logger.log('🔧 Manual trigger: Weekly appreciation');
        return await this.generateWeeklyAppreciation();
    }

    async triggerWeeklyChallenge() {
        this.logger.log('🔧 Manual trigger: Weekly challenge');
        await this.cultureBuilder.deactivatePreviousChallenges();
        return await this.cultureBuilder.generateWeeklyChallenge();
    }
}
