import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Thread } from './thread.entity';
import { ThreadUser } from './thread-user.entity';
import { CreateThreadDto } from './dto/create-thread.dto';
import { UpdateThreadDto } from './dto/update-thread.dto';

@Injectable()
export class ThreadsService {
    constructor(
        @InjectRepository(Thread)
        private threadsRepository: Repository<Thread>,
        @InjectRepository(ThreadUser)
        private threadUsersRepository: Repository<ThreadUser>,
    ) { }

    async create(createThreadDto: CreateThreadDto, userId: number): Promise<Thread> {
        const thread = this.threadsRepository.create(createThreadDto);
        const savedThread = await this.threadsRepository.save(thread);

        // Add creator as a member
        const threadUser = this.threadUsersRepository.create({
            user_id: userId,
            thread_id: savedThread.id,
            role: 'member',
        });
        await this.threadUsersRepository.save(threadUser);

        return savedThread;
    }

    async findAll(): Promise<Thread[]> {
        return this.threadsRepository.find({
            relations: ['bu', 'posts', 'threadUsers'],
            order: { created_at: 'DESC' },
        });
    }

    async findOne(id: number): Promise<Thread> {
        const thread = await this.threadsRepository.findOne({
            where: { id },
            relations: ['bu', 'posts', 'threadUsers', 'threadUsers.user'],
        });

        if (!thread) {
            throw new NotFoundException(`Thread with ID ${id} not found`);
        }

        return thread;
    }

    async update(id: number, updateThreadDto: UpdateThreadDto): Promise<Thread> {
        const thread = await this.findOne(id);
        Object.assign(thread, updateThreadDto);
        return this.threadsRepository.save(thread);
    }

    async remove(id: number): Promise<void> {
        const thread = await this.findOne(id);
        await this.threadsRepository.remove(thread);
    }

    async addUserToThread(threadId: number, userId: number, role: string = 'member'): Promise<ThreadUser> {
        const threadUser = this.threadUsersRepository.create({
            user_id: userId,
            thread_id: threadId,
            role,
        });
        return this.threadUsersRepository.save(threadUser);
    }

    async removeUserFromThread(threadId: number, userId: number): Promise<void> {
        const threadUser = await this.threadUsersRepository.findOne({
            where: { thread_id: threadId, user_id: userId },
        });

        if (threadUser) {
            await this.threadUsersRepository.remove(threadUser);
        }
    }

    async isUserModerator(threadId: number, userId: number): Promise<boolean> {
        const threadUser = await this.threadUsersRepository.findOne({
            where: { thread_id: threadId, user_id: userId, role: 'moderator' },
        });
        return !!threadUser;
    }
}
