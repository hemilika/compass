import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Thread } from '../threads/thread.entity';
import { User } from '../users/user.entity';
import { Bu } from '../bu/bu.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    @InjectRepository(Thread)
    private threadsRepository: Repository<Thread>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Bu)
    private buRepository: Repository<Bu>,
  ) {}

  async create(createPostDto: CreatePostDto, authorId: number): Promise<Post> {
    const author = await this.usersRepository.findOne({
      where: { id: authorId },
    });
    if (!author) {
      throw new NotFoundException(`Author with ID ${authorId} not found`);
    }

    const thread = await this.threadsRepository.findOne({
      where: { id: createPostDto.thread_id },
    });
    if (!thread) {
      throw new NotFoundException(
        `Thread with ID ${createPostDto.thread_id} not found`,
      );
    }

    if (createPostDto.bu_id !== undefined && createPostDto.bu_id !== null) {
      const bu = await this.buRepository.findOne({
        where: { id: createPostDto.bu_id },
      });
      if (!bu) {
        throw new NotFoundException(
          `Business Unit with ID ${createPostDto.bu_id} not found`,
        );
      }
    }

    const post = this.postsRepository.create({
      ...createPostDto,
      author_id: authorId,
    });
    return this.postsRepository.save(post);
  }

  async findAll(): Promise<Post[]> {
    return this.postsRepository.find({
      relations: ['author', 'thread', 'bu', 'replies'],
      order: { created_at: 'DESC' },
    });
  }

  async findByThread(threadId: number): Promise<Post[]> {
    return this.postsRepository.find({
      where: { thread_id: threadId },
      relations: ['author', 'thread', 'bu', 'replies'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Post> {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: ['author', 'thread', 'bu', 'replies', 'replies.author'],
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    return post;
  }

  async update(id: number, updatePostDto: UpdatePostDto): Promise<Post> {
    const post = await this.findOne(id);
    Object.assign(post, updatePostDto);
    return this.postsRepository.save(post);
  }

  async remove(id: number): Promise<void> {
    // Check if post exists first (idempotent - return silently if not found)
    const post = await this.postsRepository.findOne({
      where: { id },
    });

    if (!post) {
      // Post doesn't exist, return silently (idempotent behavior)
      return;
    }

    // Use a transaction to ensure atomicity of cascading deletes
    await this.postsRepository.manager.transaction(
      async (transactionalEntityManager) => {
        // Delete the post - cascades will handle:
        // - All replies (and their nested replies via childReplies cascade)
        // - All upvotes for the post
        // - Associated challenges (if any)
        // - Associated appreciation threads (if any)
        await transactionalEntityManager.remove(Post, post);
      },
    );
  }

  async incrementUpvoteCount(id: number): Promise<Post> {
    const post = await this.findOne(id);
    post.upvote_count += 1;
    return this.postsRepository.save(post);
  }

  async decrementUpvoteCount(id: number): Promise<Post> {
    const post = await this.findOne(id);
    post.upvote_count = Math.max(0, post.upvote_count - 1);
    return this.postsRepository.save(post);
  }
}
