import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThreadsService } from './threads.service';
import { ThreadsController } from './threads.controller';
import { Thread } from './thread.entity';
import { ThreadUser } from './thread-user.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Thread, ThreadUser])],
    controllers: [ThreadsController],
    providers: [ThreadsService],
    exports: [ThreadsService],
})
export class ThreadsModule { }
