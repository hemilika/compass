import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { CultureBuilderController } from './culture-builder.controller';
import { CultureBuilderService } from './culture-builder.service';
import { CultureAnalyticsService } from './culture-analytics.service';
import { CultureSchedulerService } from './culture-scheduler.service';
import { CultureAiService } from './culture-ai.service';
import { AppreciationThread } from './entities/appreciation-thread.entity';
import { Challenge } from './entities/challenge.entity';
import { Post } from '../posts/post.entity';
import { Reply } from '../replies/reply.entity';
import { User } from '../users/user.entity';
import { Bu } from '../bu/bu.entity';
import { Thread } from '../threads/thread.entity';
import { ThreadUser } from '../threads/thread-user.entity';
import { Upvote } from '../upvotes/upvote.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            AppreciationThread,
            Challenge,
            Post,
            Reply,
            User,
            Bu,
            Thread,
            ThreadUser,
            Upvote,
        ]),
        ScheduleModule.forRoot(),
    ],
    controllers: [CultureBuilderController],
    providers: [
        CultureBuilderService,
        CultureAnalyticsService,
        CultureSchedulerService,
        CultureAiService,
    ],
    exports: [CultureBuilderService],
})
export class CultureBuilderModule { }
