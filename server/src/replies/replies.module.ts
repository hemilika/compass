import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RepliesService } from './replies.service';
import { RepliesController } from './replies.controller';
import { Reply } from './reply.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Reply])],
    controllers: [RepliesController],
    providers: [RepliesService],
    exports: [RepliesService],
})
export class RepliesModule { }
