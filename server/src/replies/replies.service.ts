import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reply } from './reply.entity';
import { CreateReplyDto } from './dto/create-reply.dto';
import { UpdateReplyDto } from './dto/update-reply.dto';

@Injectable()
export class RepliesService {
    constructor(
        @InjectRepository(Reply)
        private repliesRepository: Repository<Reply>,
    ) { }

    async create(createReplyDto: CreateReplyDto, authorId: number): Promise<Reply> {
        const reply = this.repliesRepository.create({
            ...createReplyDto,
            author_id: authorId,
        });
        return this.repliesRepository.save(reply);
    }

    async findByPost(postId: number): Promise<Reply[]> {
        return this.repliesRepository.find({
            where: { post_id: postId },
            relations: ['author', 'parentReply', 'childReplies', 'childReplies.author'],
            order: { created_at: 'ASC' },
        });
    }

    async findOne(id: number): Promise<Reply> {
        const reply = await this.repliesRepository.findOne({
            where: { id },
            relations: ['author', 'post', 'parentReply', 'childReplies', 'childReplies.author'],
        });

        if (!reply) {
            throw new NotFoundException(`Reply with ID ${id} not found`);
        }

        return reply;
    }

    async update(id: number, updateReplyDto: UpdateReplyDto): Promise<Reply> {
        const reply = await this.findOne(id);
        Object.assign(reply, updateReplyDto);
        return this.repliesRepository.save(reply);
    }

    async remove(id: number): Promise<void> {
        const reply = await this.findOne(id);
        await this.repliesRepository.remove(reply);
    }

    async incrementUpvoteCount(id: number): Promise<Reply> {
        const reply = await this.findOne(id);
        reply.upvote_count += 1;
        return this.repliesRepository.save(reply);
    }

    async decrementUpvoteCount(id: number): Promise<Reply> {
        const reply = await this.findOne(id);
        reply.upvote_count = Math.max(0, reply.upvote_count - 1);
        return this.repliesRepository.save(reply);
    }
}
