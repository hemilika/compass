import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UpvotesService } from './upvotes.service';
import { UpvotesController } from './upvotes.controller';
import { Upvote } from './upvote.entity';
import { PostsModule } from '../posts/posts.module';
import { RepliesModule } from '../replies/replies.module';

@Module({
  imports: [TypeOrmModule.forFeature([Upvote]), PostsModule, RepliesModule],
  controllers: [UpvotesController],
  providers: [UpvotesService],
  exports: [UpvotesService],
})
export class UpvotesModule {}
