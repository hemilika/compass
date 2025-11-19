import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bu } from 'src/bu/bu.entity';
import { Thread } from 'src/threads/thread.entity';
import { Reply } from 'src/replies/reply.entity';
import { Post } from 'src/posts/post.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bu, Thread, Post, Reply]),
  ],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule { }
