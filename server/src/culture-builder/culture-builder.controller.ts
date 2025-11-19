import { Controller, Post, Get, UseGuards, Body } from '@nestjs/common';
import { CultureBuilderService } from './culture-builder.service';
import { CultureSchedulerService } from './culture-scheduler.service';
import { CultureAnalyticsService } from './culture-analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GenerateAppreciationDto } from './dto/generate-appreciation.dto';
import { GenerateChallengeDto } from './dto/generate-challenge.dto';

@Controller('culture-builder')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CultureBuilderController {
    constructor(
        private readonly cultureBuilder: CultureBuilderService,
        private readonly scheduler: CultureSchedulerService,
        private readonly analytics: CultureAnalyticsService,
    ) { }

    // Admin-only manual triggers
    @Post('generate/appreciation')
    @Roles('admin')
    async generateAppreciation(@Body() dto: GenerateAppreciationDto) {
        const post = await this.cultureBuilder.manualGenerateAppreciation(dto.days || 7);
        return {
            message: 'Appreciation thread generated successfully',
            postId: post.id,
            postTitle: post.title,
        };
    }

    @Post('generate/challenge')
    @Roles('admin')
    async generateChallenge(@Body() dto: GenerateChallengeDto) {
        const post = await this.cultureBuilder.manualGenerateChallenge(dto.type);
        return {
            message: 'Challenge generated successfully',
            postId: post.id,
            postTitle: post.title,
        };
    }

    // Manual scheduler triggers for testing
    @Post('trigger/weekly-appreciation')
    @Roles('admin')
    async triggerWeeklyAppreciation() {
        await this.scheduler.triggerWeeklyAppreciation();
        return { message: 'Weekly appreciation triggered' };
    }

    @Post('trigger/weekly-challenge')
    @Roles('admin')
    async triggerWeeklyChallenge() {
        await this.scheduler.triggerWeeklyChallenge();
        return { message: 'Weekly challenge triggered' };
    }

    // Analytics endpoints
    @Get('analytics/weekly')
    async getWeeklyAnalytics() {
        return await this.analytics.getWeeklyAnalytics();
    }

    @Get('analytics/top-contributors')
    async getTopContributors() {
        return await this.analytics.getTopContributors(7);
    }

    @Get('health')
    health() {
        return {
            status: 'ok',
            service: 'culture-builder',
            timestamp: new Date().toISOString(),
        };
    }

    // Public endpoints for users
    @Get('challenges/active')
    async getActiveChallenges() {
        return await this.cultureBuilder.getActiveChallenges();
    }

    @Get('challenges/recent')
    async getRecentChallenges() {
        return await this.cultureBuilder.getRecentChallenges(5);
    }
}
