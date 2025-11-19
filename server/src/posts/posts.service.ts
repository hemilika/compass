import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
    constructor(
        @InjectRepository(Post)
        private postsRepository: Repository<Post>,
    ) { }

    async create(createPostDto: CreatePostDto, authorId: number): Promise<Post> {
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
        const post = await this.findOne(id);
        await this.postsRepository.remove(post);
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
