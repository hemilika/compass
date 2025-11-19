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
        ]),
    ],
    providers: [SeederService],
    exports: [SeederService],
})
export class DatabaseModule { }
