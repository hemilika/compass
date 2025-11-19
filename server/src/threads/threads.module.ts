import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThreadsService } from './threads.service';
import { ThreadsController } from './threads.controller';
import { Thread } from './thread.entity';
import { ThreadUser } from './thread-user.entity';
import { Bu } from '../bu/bu.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Thread, ThreadUser, Bu])],
  controllers: [ThreadsController],
  providers: [ThreadsService],
  exports: [ThreadsService],
})
export class ThreadsModule {}
