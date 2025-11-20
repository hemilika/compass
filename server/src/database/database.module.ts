import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';
import { User } from '../users/user.entity';
import { Bu } from '../bu/bu.entity';
import { Thread } from '../threads/thread.entity';
import { ThreadUser } from '../threads/thread-user.entity';
import { Post } from '../posts/post.entity';
import { Reply } from '../replies/reply.entity';
import { Upvote } from '../upvotes/upvote.entity';
import { CultureQuiz } from '../culture-builder/entities/quiz.entity';
import { CultureQuizSubmission } from '../culture-builder/entities/quiz-submission.entity';
import { AppreciationThread } from '../culture-builder/entities/appreciation-thread.entity';
import { Challenge } from '../culture-builder/entities/challenge.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Bu,
      Thread,
      ThreadUser,
      Post,
      Reply,
      Upvote,
      CultureQuiz,
      CultureQuizSubmission,
      AppreciationThread,
      Challenge,
    ]),
  ],
  providers: [SeederService],
  exports: [SeederService],
})
export class DatabaseModule {}
