import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In } from 'typeorm';
import { Thread } from './thread.entity';
import { ThreadUser } from './thread-user.entity';
import { CreateThreadDto } from './dto/create-thread.dto';
import { UpdateThreadDto } from './dto/update-thread.dto';
import { Bu } from '../bu/bu.entity';
import { User } from '../users/user.entity';

@Injectable()
export class ThreadsService {
  constructor(
    @InjectRepository(Thread)
    private threadsRepository: Repository<Thread>,
    @InjectRepository(ThreadUser)
    private threadUsersRepository: Repository<ThreadUser>,
    @InjectRepository(Bu)
    private buRepository: Repository<Bu>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(
    createThreadDto: CreateThreadDto,
    userId: number,
  ): Promise<Thread> {
    if (createThreadDto.bu_id !== undefined && createThreadDto.bu_id !== null) {
      const buExists = await this.buRepository.findOne({
        where: { id: createThreadDto.bu_id },
      });
      if (!buExists) {
        throw new NotFoundException(
          `Business Unit with ID ${createThreadDto.bu_id} not found`,
        );
      }
    }

    const thread = this.threadsRepository.create({
      ...createThreadDto,
      creator_id: userId,
    });
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
    // Idempotent: Check if thread exists first
    const thread = await this.threadsRepository.findOne({
      where: { id },
    });

    if (!thread) {
      // Thread doesn't exist, return silently (idempotent behavior)
      return;
    }

    // Remove all thread-user relationships
    await this.threadUsersRepository.delete({ thread_id: id });

    // Remove the thread
    await this.threadsRepository.remove(thread);
  }

  async addUserToThread(
    threadId: number,
    userId: number,
    role: string = 'member',
  ): Promise<ThreadUser> {
    // Check if thread exists
    await this.findOne(threadId);

    // Check if user is already a member
    const existingMembership = await this.threadUsersRepository.findOne({
      where: { thread_id: threadId, user_id: userId },
    });

    if (existingMembership) {
      return existingMembership; // Already a member, return existing membership
    }

    const threadUser = this.threadUsersRepository.create({
      user_id: userId,
      thread_id: threadId,
      role,
    });
    return this.threadUsersRepository.save(threadUser);
  }

  async removeUserFromThread(threadId: number, userId: number): Promise<void> {
    // Idempotent: Check if user is a member first
    const threadUser = await this.threadUsersRepository.findOne({
      where: { thread_id: threadId, user_id: userId },
    });

    if (threadUser) {
      await this.threadUsersRepository.remove(threadUser);
    }
    // If user is not a member, return silently (idempotent behavior)
  }

  async isUserModerator(threadId: number, userId: number): Promise<boolean> {
    const threadUser = await this.threadUsersRepository.findOne({
      where: { thread_id: threadId, user_id: userId, role: 'moderator' },
    });
    return !!threadUser;
  }

  async getRecommendedThreads(
    userId: number,
    limit: number = 10,
  ): Promise<any[]> {
    // Get user's current threads
    const userThreads = await this.threadUsersRepository.find({
      where: { user_id: userId },
      select: ['thread_id'],
    });
    const joinedThreadIds = userThreads.map((ut) => ut.thread_id);

    // Get user with full profile including interests
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['bu'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Get all threads (including joined ones for fallback)
    const allThreads = await this.threadsRepository.find({
      relations: ['bu'],
    });

    // Separate joined and unjoined threads
    const unjoinedThreads = allThreads.filter(
      (t) => !joinedThreadIds.includes(t.id),
    );

    // If less than limit unjoined threads, we'll need all threads
    const threadsToScore =
      unjoinedThreads.length >= limit ? unjoinedThreads : allThreads;

    if (threadsToScore.length === 0) {
      return [];
    }

    // Get member counts for each thread separately
    const threadsWithCounts = await Promise.all(
      threadsToScore.map(async (thread) => {
        const memberCount = await this.threadUsersRepository.count({
          where: { thread_id: thread.id },
        });
        const isJoined = joinedThreadIds.includes(thread.id);
        return { ...thread, member_count: memberCount, isJoined };
      }),
    );

    // Build user interest keywords from techstack, hobbies, and roles
    const userKeywords = [
      ...(user.techstack || []),
      ...(user.hobbies || []),
      ...(user.user_roles || []),
    ].map((k) => k.toLowerCase());

    // Calculate relevance score for each thread
    const scoredThreads = threadsWithCounts.map((thread) => {
      let score = 0;
      const threadText =
        `${thread.name} ${thread.description || ''}`.toLowerCase();

      // 1. Match user interests with thread content (highest weight)
      userKeywords.forEach((keyword) => {
        if (threadText.includes(keyword.toLowerCase())) {
          score += 10; // High score for direct keyword match
        }
        // Partial match (contains part of the keyword)
        const words = threadText.split(/\s+/);
        words.forEach((word) => {
          if (word.includes(keyword) || keyword.includes(word)) {
            score += 3; // Lower score for partial match
          }
        });
      });

      // 2. Same BU bonus
      if (user.bu_id && thread.bu_id === user.bu_id) {
        score += 15;
      }

      // 3. Global threads (accessible to all) get a boost
      if (!thread.bu_id) {
        score += 8;
      }

      // 4. Popularity bonus (member count from query)
      const memberCount = (thread as any).member_count || 0;
      score += Math.min(memberCount * 0.5, 10); // Cap at 10 points

      // 5. Recency bonus
      const daysSinceCreation =
        (Date.now() - new Date(thread.created_at).getTime()) /
        (1000 * 60 * 60 * 24);
      if (daysSinceCreation < 7) {
        score += 5; // New threads get a boost
      }

      // 6. Base score to ensure all threads have some relevance
      score += 1;

      return {
        ...thread,
        relevanceScore: score,
        memberCount: memberCount,
        matchedKeywords: userKeywords.filter((k) =>
          threadText.includes(k.toLowerCase()),
        ),
        isJoined: thread.isJoined,
      };
    });

    // Sort: unjoined threads first, then by relevance score
    let sortedThreads = scoredThreads.sort((a, b) => {
      // Prioritize unjoined threads
      if (a.isJoined !== b.isJoined) {
        return a.isJoined ? 1 : -1;
      }
      // Then sort by relevance
      return b.relevanceScore - a.relevanceScore;
    });

    // Return up to limit
    return sortedThreads.slice(0, limit);
  }
}
