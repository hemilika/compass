import {
  Controller,
  Post,
  Get,
  UseGuards,
  Body,
  Param,
  Req,
} from '@nestjs/common';
import { CultureBuilderService } from './culture-builder.service';
import { CultureSchedulerService } from './culture-scheduler.service';
import { CultureAnalyticsService } from './culture-analytics.service';
import { CultureQuizService } from './culture-quiz.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GenerateAppreciationDto } from './dto/generate-appreciation.dto';
import { GenerateChallengeDto } from './dto/generate-challenge.dto';
import { GenerateQuizDto } from './dto/generate-quiz.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';

@Controller('culture-builder')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CultureBuilderController {
  constructor(
    private readonly cultureBuilder: CultureBuilderService,
    private readonly scheduler: CultureSchedulerService,
    private readonly analytics: CultureAnalyticsService,
    private readonly quizService: CultureQuizService,
  ) {}

  // Admin-only manual triggers
  @Post('generate/appreciation')
  @Roles('admin')
  async generateAppreciation(@Body() dto: GenerateAppreciationDto) {
    const post = await this.cultureBuilder.manualGenerateAppreciation(
      dto.days || 7,
    );
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
  @Get('top/posts')
  async getWeeklyAnalytics() {
    return await this.analytics.getWeeklyAnalytics();
  }

  @Get('top/contributors')
  async getTopContributors() {
    return await this.analytics.getTopContributors(7);
  }

  @Get('challenges/active')
  async getActiveChallenges() {
    return await this.cultureBuilder.getActiveChallenges();
  }

  @Get('challenges/recent')
  async getRecentChallenges() {
    return await this.cultureBuilder.getRecentChallenges(5);
  }

  // Quiz endpoints
  @Post('quiz/generate')
  @Roles('admin')
  async generateQuiz(@Body() dto: GenerateQuizDto) {
    const quiz = await this.quizService.generateQuiz(dto.challengeType);
    return {
      message: 'Quiz generated successfully',
      quiz,
    };
  }

  @Get('quiz/active')
  async getActiveQuiz() {
    const quiz = await this.quizService.getActiveQuiz();
    if (!quiz) {
      return { message: 'No active quiz available' };
    }
    return quiz;
  }

  @Post('quiz/submit')
  async submitQuiz(@Body() dto: SubmitQuizDto, @Req() req) {
    const userId = req.user.userId;
    const result = await this.quizService.submitQuiz(userId, dto);
    return result;
  }

  @Get('quiz/my-submissions')
  async getMySubmissions(@Req() req) {
    const userId = req.user.userId;
    return await this.quizService.getUserSubmissions(userId);
  }

  @Get('quiz/:quizId/leaderboard')
  async getQuizLeaderboard(@Param('quizId') quizId: string) {
    return await this.quizService.getQuizLeaderboard(parseInt(quizId), 10);
  }
}
