import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Bu } from '../bu/bu.entity';
import { Thread } from '../threads/thread.entity';
import { ThreadUser } from '../threads/thread-user.entity';
import { Post } from '../posts/post.entity';
import { Reply } from '../replies/reply.entity';
import { Upvote } from '../upvotes/upvote.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeederService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Bu)
        private buRepository: Repository<Bu>,
        @InjectRepository(Thread)
        private threadRepository: Repository<Thread>,
        @InjectRepository(ThreadUser)
        private threadUserRepository: Repository<ThreadUser>,
        @InjectRepository(Post)
        private postRepository: Repository<Post>,
        @InjectRepository(Reply)
        private replyRepository: Repository<Reply>,
        @InjectRepository(Upvote)
        private upvoteRepository: Repository<Upvote>,
    ) { }

    async seed() {
        console.log('🌱 Starting database seeding...');

        // Clear existing data
        await this.clearDatabase();

        // Seed in order due to foreign key constraints
        const users = await this.seedUsers();
        console.log('✅ Users seeded');

        const bus = await this.seedBusinessUnits();
        console.log('✅ Business Units seeded');

        const threads = await this.seedThreads(bus);
        console.log('✅ Threads seeded');

        await this.seedThreadUsers(users, threads);
        console.log('✅ Thread memberships seeded');

        const posts = await this.seedPosts(users, threads, bus);
        console.log('✅ Posts seeded');

        const replies = await this.seedReplies(users, posts);
        console.log('✅ Replies seeded');

        await this.seedUpvotes(users, posts, replies);
        console.log('✅ Upvotes seeded');

        console.log('🎉 Database seeding completed successfully!');
    }

    private async clearDatabase() {
        console.log('🗑️  Clearing existing data...');
        await this.upvoteRepository.createQueryBuilder().delete().execute();
        await this.replyRepository.createQueryBuilder().delete().execute();
        await this.postRepository.createQueryBuilder().delete().execute();
        await this.threadUserRepository.createQueryBuilder().delete().execute();
        await this.threadRepository.createQueryBuilder().delete().execute();
        await this.buRepository.createQueryBuilder().delete().execute();
        await this.userRepository.createQueryBuilder().delete().execute();
    }

    private async seedUsers(): Promise<User[]> {
        const hashedPassword = await bcrypt.hash('password123', 10);

        const usersData = [
            {
                email: 'admin@compass.com',
                password: hashedPassword,
                firstname: 'Admin',
                lastname: 'User',
                roles: ['admin', 'user'],
                techstack: ['NestJS', 'React', 'PostgreSQL'],
                user_roles: ['Tech Lead'],
                hobbies: ['Coding', 'Reading'],
                is_active: true,
            },
            {
                email: 'john.doe@compass.com',
                password: hashedPassword,
                firstname: 'John',
                lastname: 'Doe',
                roles: ['user'],
                techstack: ['React', 'TypeScript', 'Node.js'],
                user_roles: ['Frontend Developer'],
                hobbies: ['Gaming', 'Photography'],
                is_active: true,
            },
            {
                email: 'jane.smith@compass.com',
                password: hashedPassword,
                firstname: 'Jane',
                lastname: 'Smith',
                roles: ['user'],
                techstack: ['Python', 'Django', 'PostgreSQL'],
                user_roles: ['Backend Developer'],
                hobbies: ['Hiking', 'Cooking'],
                is_active: true,
            },
            {
                email: 'bob.johnson@compass.com',
                password: hashedPassword,
                firstname: 'Bob',
                lastname: 'Johnson',
                roles: ['user'],
                techstack: ['Vue.js', 'Express', 'MongoDB'],
                user_roles: ['Full Stack Developer'],
                hobbies: ['Music', 'Travel'],
                is_active: true,
            },
            {
                email: 'alice.williams@compass.com',
                password: hashedPassword,
                firstname: 'Alice',
                lastname: 'Williams',
                roles: ['user'],
                techstack: ['React Native', 'Swift', 'Kotlin'],
                user_roles: ['Mobile Developer'],
                hobbies: ['Fitness', 'Art'],
                is_active: true,
            },
            {
                email: 'charlie.brown@compass.com',
                password: hashedPassword,
                firstname: 'Charlie',
                lastname: 'Brown',
                roles: ['user'],
                techstack: ['DevOps', 'AWS', 'Docker'],
                user_roles: ['DevOps Engineer'],
                hobbies: ['Cycling', 'Movies'],
                is_active: true,
            },
        ];

        const users = this.userRepository.create(usersData);
        return await this.userRepository.save(users);
    }

    private async seedBusinessUnits(): Promise<Bu[]> {
        const busData = [
            { name: 'Engineering' },
            { name: 'Product' },
            { name: 'Design' },
            { name: 'Marketing' },
            { name: 'Sales' },
            { name: 'Customer Support' },
        ];

        const bus = this.buRepository.create(busData);
        return await this.buRepository.save(bus);
    }

    private async seedThreads(bus: Bu[]): Promise<Thread[]> {
        const threadsData = [
            {
                name: 'Welcome to Compass',
                description: 'Introduce yourself and get to know the community',
                bu_id: bus[0].id,
            },
            {
                name: 'Tech Stack Discussions',
                description: 'Share and discuss your favorite technologies',
                bu_id: bus[0].id,
            },
            {
                name: 'Best Practices',
                description: 'Share coding best practices and tips',
                bu_id: bus[0].id,
            },
            {
                name: 'Product Ideas',
                description: 'Brainstorm new product features and ideas',
                bu_id: bus[1].id,
            },
            {
                name: 'Design Showcase',
                description: 'Share your latest designs and get feedback',
                bu_id: bus[2].id,
            },
            {
                name: 'Random Chat',
                description: 'Off-topic discussions and casual conversation',
                bu_id: undefined,
            },
        ];

        const threads = this.threadRepository.create(threadsData);
        return await this.threadRepository.save(threads);
    }

    private async seedThreadUsers(users: User[], threads: Thread[]) {
        const threadUsersData = [
            // Admin is moderator in all threads
            ...threads.map((thread) => ({
                user_id: users[0].id,
                thread_id: thread.id,
                role: 'moderator',
            })),
            // Other users are members
            { user_id: users[1].id, thread_id: threads[0].id, role: 'member' },
            { user_id: users[1].id, thread_id: threads[1].id, role: 'member' },
            { user_id: users[2].id, thread_id: threads[0].id, role: 'member' },
            { user_id: users[2].id, thread_id: threads[2].id, role: 'moderator' },
            { user_id: users[3].id, thread_id: threads[1].id, role: 'member' },
            { user_id: users[3].id, thread_id: threads[5].id, role: 'member' },
            { user_id: users[4].id, thread_id: threads[3].id, role: 'member' },
            { user_id: users[5].id, thread_id: threads[4].id, role: 'member' },
        ];

        const threadUsers = this.threadUserRepository.create(threadUsersData);
        await this.threadUserRepository.save(threadUsers);
    }

    private async seedPosts(
        users: User[],
        threads: Thread[],
        bus: Bu[],
    ): Promise<Post[]> {
        const postsData = [
            {
                thread_id: threads[0].id,
                bu_id: bus[0].id,
                author_id: users[1].id,
                title: 'Hello everyone!',
                content:
                    "Hi, I'm John! I'm a frontend developer working with React and TypeScript. Excited to be part of this community!",
                icon_url: undefined,
                image_urls: [],
                upvote_count: 5,
            },
            {
                thread_id: threads[0].id,
                bu_id: bus[0].id,
                author_id: users[2].id,
                title: 'New member introduction',
                content:
                    "Hello! I'm Jane, a backend developer specializing in Python and Django. Looking forward to learning from everyone here.",
                icon_url: undefined,
                image_urls: [],
                upvote_count: 3,
            },
            {
                thread_id: threads[1].id,
                bu_id: bus[0].id,
                author_id: users[1].id,
                title: 'Why I love TypeScript',
                content:
                    'TypeScript has completely changed how I write JavaScript. The type safety catches so many bugs before runtime. What are your thoughts?',
                icon_url: undefined,
                image_urls: [],
                upvote_count: 8,
            },
            {
                thread_id: threads[1].id,
                bu_id: bus[0].id,
                author_id: users[3].id,
                title: 'Vue 3 vs React - Your opinion?',
                content:
                    "I've been using Vue 3 for a while now, and I'm curious about React. What do you all prefer and why?",
                icon_url: undefined,
                image_urls: [],
                upvote_count: 12,
            },
            {
                thread_id: threads[2].id,
                bu_id: bus[0].id,
                author_id: users[2].id,
                title: 'Clean Code Principles',
                content:
                    "Let's discuss clean code principles. What are your top 3 rules for writing maintainable code?",
                icon_url: undefined,
                image_urls: [],
                upvote_count: 15,
            },
            {
                thread_id: threads[2].id,
                bu_id: bus[0].id,
                author_id: users[0].id,
                title: 'Code Review Best Practices',
                content:
                    'Effective code reviews are crucial for team success. Here are my tips: 1) Be constructive, 2) Focus on the code not the person, 3) Ask questions instead of making demands.',
                icon_url: undefined,
                image_urls: [],
                upvote_count: 20,
            },
            {
                thread_id: threads[3].id,
                bu_id: bus[1].id,
                author_id: users[4].id,
                title: 'Feature Request: Dark Mode',
                content:
                    'It would be great to have a dark mode option for the platform. Who else would find this useful?',
                icon_url: undefined,
                image_urls: [],
                upvote_count: 25,
            },
            {
                thread_id: threads[4].id,
                bu_id: bus[2].id,
                author_id: users[5].id,
                title: 'My latest UI design',
                content:
                    'Just finished designing a new dashboard interface. Would love to get your feedback on the color scheme and layout!',
                icon_url: undefined,
                image_urls: [],
                upvote_count: 10,
            },
            {
                thread_id: threads[5].id,
                bu_id: undefined,
                author_id: users[3].id,
                title: 'What are you working on this weekend?',
                content:
                    "It's Friday! Anyone have interesting side projects or plans for the weekend?",
                icon_url: undefined,
                image_urls: [],
                upvote_count: 7,
            },
            {
                thread_id: threads[5].id,
                bu_id: undefined,
                author_id: users[1].id,
                title: 'Favorite coding music?',
                content:
                    "What do you all listen to while coding? I'm always looking for new recommendations!",
                icon_url: undefined,
                image_urls: [],
                upvote_count: 6,
            },
        ];

        const posts = this.postRepository.create(postsData);
        return await this.postRepository.save(posts);
    }

    private async seedReplies(users: User[], posts: Post[]): Promise<Reply[]> {
        const repliesData = [
            {
                post_id: posts[0].id,
                author_id: users[0].id,
                parent_reply_id: undefined,
                content: 'Welcome to Compass, John! Great to have you here!',
                image_urls: [],
                upvote_count: 2,
            },
            {
                post_id: posts[0].id,
                author_id: users[2].id,
                parent_reply_id: undefined,
                content: 'Hi John! Looking forward to collaborating with you.',
                image_urls: [],
                upvote_count: 1,
            },
            {
                post_id: posts[2].id,
                author_id: users[2].id,
                parent_reply_id: undefined,
                content:
                    'I completely agree! TypeScript has been a game-changer for our team.',
                image_urls: [],
                upvote_count: 4,
            },
            {
                post_id: posts[2].id,
                author_id: users[3].id,
                parent_reply_id: undefined,
                content:
                    'The learning curve was steep for me, but totally worth it in the end.',
                image_urls: [],
                upvote_count: 3,
            },
            {
                post_id: posts[3].id,
                author_id: users[1].id,
                parent_reply_id: undefined,
                content:
                    "I've used both extensively. React has a larger ecosystem, but Vue's simplicity is hard to beat for smaller projects.",
                image_urls: [],
                upvote_count: 5,
            },
            {
                post_id: posts[4].id,
                author_id: users[0].id,
                parent_reply_id: undefined,
                content:
                    'My top 3: 1) Meaningful variable names, 2) Single responsibility principle, 3) Write tests!',
                image_urls: [],
                upvote_count: 8,
            },
            {
                post_id: posts[4].id,
                author_id: users[1].id,
                parent_reply_id: undefined,
                content: 'Don\'t forget "Don\'t Repeat Yourself" (DRY) principle!',
                image_urls: [],
                upvote_count: 6,
            },
            {
                post_id: posts[5].id,
                author_id: users[2].id,
                parent_reply_id: undefined,
                content: 'Great tips! I would add: always test your own code before requesting review.',
                image_urls: [],
                upvote_count: 7,
            },
            {
                post_id: posts[6].id,
                author_id: users[0].id,
                parent_reply_id: undefined,
                content: 'Dark mode is on our roadmap! Should be coming soon.',
                image_urls: [],
                upvote_count: 10,
            },
            {
                post_id: posts[6].id,
                author_id: users[1].id,
                parent_reply_id: undefined,
                content: 'Yes please! My eyes will thank you.',
                image_urls: [],
                upvote_count: 8,
            },
            {
                post_id: posts[8].id,
                author_id: users[1].id,
                parent_reply_id: undefined,
                content: 'Working on a personal blog with Next.js!',
                image_urls: [],
                upvote_count: 3,
            },
            {
                post_id: posts[9].id,
                author_id: users[2].id,
                parent_reply_id: undefined,
                content: 'Lo-fi hip hop beats always help me focus.',
                image_urls: [],
                upvote_count: 4,
            },
        ];

        const replies = this.replyRepository.create(repliesData);
        return await this.replyRepository.save(replies);
    }

    private async seedUpvotes(users: User[], posts: Post[], replies: Reply[]) {
        const upvotesData = [
            // Post upvotes
            { user_id: users[0].id, post_id: posts[0].id, type: 'post' },
            { user_id: users[2].id, post_id: posts[0].id, type: 'post' },
            { user_id: users[3].id, post_id: posts[0].id, type: 'post' },
            { user_id: users[0].id, post_id: posts[2].id, type: 'post' },
            { user_id: users[2].id, post_id: posts[2].id, type: 'post' },
            { user_id: users[3].id, post_id: posts[3].id, type: 'post' },
            { user_id: users[0].id, post_id: posts[4].id, type: 'post' },
            { user_id: users[1].id, post_id: posts[4].id, type: 'post' },
            { user_id: users[0].id, post_id: posts[6].id, type: 'post' },
            { user_id: users[1].id, post_id: posts[6].id, type: 'post' },
            { user_id: users[2].id, post_id: posts[6].id, type: 'post' },
            // Reply upvotes
            { user_id: users[1].id, reply_id: replies[0].id, type: 'reply' },
            { user_id: users[2].id, reply_id: replies[2].id, type: 'reply' },
            { user_id: users[0].id, reply_id: replies[4].id, type: 'reply' },
            { user_id: users[1].id, reply_id: replies[5].id, type: 'reply' },
            { user_id: users[2].id, reply_id: replies[7].id, type: 'reply' },
        ];

        const upvotes = this.upvoteRepository.create(upvotesData);
        await this.upvoteRepository.save(upvotes);
    }
}
