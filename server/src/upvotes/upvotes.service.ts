import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Upvote } from './upvote.entity';
import { PostsService } from '../posts/posts.service';
import { RepliesService } from '../replies/replies.service';

@Injectable()
export class UpvotesService {
  constructor(
    @InjectRepository(Upvote)
    private upvotesRepository: Repository<Upvote>,
    private postsService: PostsService,
    private repliesService: RepliesService,
  ) {}

  async upvotePost(postId: number, userId: number): Promise<Upvote> {
    // Check if post exists
    await this.postsService.findOne(postId);

    // Check if user already upvoted
    const existing = await this.upvotesRepository.findOne({
      where: { user_id: userId, post_id: postId, type: 'post' },
    });

    if (existing) {
      throw new ConflictException('You have already upvoted this post');
    }

    const upvote = this.upvotesRepository.create({
      user_id: userId,
      post_id: postId,
      type: 'post',
    });

    const saved = await this.upvotesRepository.save(upvote);
    await this.postsService.incrementUpvoteCount(postId);

    return saved;
  }

  async removeUpvotePost(postId: number, userId: number): Promise<void> {
    const upvote = await this.upvotesRepository.findOne({
      where: { user_id: userId, post_id: postId, type: 'post' },
    });

    if (!upvote) {
      throw new NotFoundException('Upvote not found');
    }

    await this.upvotesRepository.remove(upvote);
    await this.postsService.decrementUpvoteCount(postId);
  }

  async upvoteReply(replyId: number, userId: number): Promise<Upvote> {
    // Check if reply exists
    await this.repliesService.findOne(replyId);

    // Check if user already upvoted
    const existing = await this.upvotesRepository.findOne({
      where: { user_id: userId, reply_id: replyId, type: 'reply' },
    });

    if (existing) {
      throw new ConflictException('You have already upvoted this reply');
    }

    const upvote = this.upvotesRepository.create({
      user_id: userId,
      reply_id: replyId,
      type: 'reply',
    });

    const saved = await this.upvotesRepository.save(upvote);
    await this.repliesService.incrementUpvoteCount(replyId);

    return saved;
  }

  async removeUpvoteReply(replyId: number, userId: number): Promise<void> {
    const upvote = await this.upvotesRepository.findOne({
      where: { user_id: userId, reply_id: replyId, type: 'reply' },
    });

    if (!upvote) {
      throw new NotFoundException('Upvote not found');
    }

    await this.upvotesRepository.remove(upvote);
    await this.repliesService.decrementUpvoteCount(replyId);
  }

  async getUserUpvotes(userId: number): Promise<Upvote[]> {
    return this.upvotesRepository.find({
      where: { user_id: userId },
      relations: ['post', 'reply'],
    });
  }
}
