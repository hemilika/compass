import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { Post } from './post.entity';
import { Thread } from '../threads/thread.entity';
import { User } from '../users/user.entity';
import { Bu } from '../bu/bu.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Post, Thread, User, Bu])],
    controllers: [PostsController],
    providers: [PostsService],
    exports: [PostsService],
})
export class PostsModule { }
