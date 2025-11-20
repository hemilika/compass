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
import { CultureQuiz } from '../culture-builder/entities/quiz.entity';
import { CultureQuizSubmission } from '../culture-builder/entities/quiz-submission.entity';
import { AppreciationThread } from '../culture-builder/entities/appreciation-thread.entity';
import { Challenge } from '../culture-builder/entities/challenge.entity';
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
    @InjectRepository(CultureQuiz)
    private quizRepository: Repository<CultureQuiz>,
    @InjectRepository(CultureQuizSubmission)
    private quizSubmissionRepository: Repository<CultureQuizSubmission>,
    @InjectRepository(AppreciationThread)
    private appreciationThreadRepository: Repository<AppreciationThread>,
    @InjectRepository(Challenge)
    private challengeRepository: Repository<Challenge>,
  ) {}

  async seed() {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await this.clearDatabase();

    // Seed in order due to foreign key constraints
    const users = await this.seedUsers();
    console.log('✅ Users seeded');

    const bus = await this.seedBusinessUnits();
    console.log('✅ Business Units seeded');

    // Assign users to BUs
    await this.assignUsersToBUs(users, bus);
    console.log('✅ Users assigned to BUs');

    const threads = await this.seedThreads(bus, users);
    console.log('✅ Threads seeded');

    await this.seedThreadUsers(users, threads);
    console.log('✅ Thread memberships seeded');

    const posts = await this.seedPosts(users, threads, bus);
    console.log('✅ Posts seeded');

    const replies = await this.seedReplies(users, posts);
    console.log('✅ Replies seeded');

    await this.seedUpvotes(users, posts, replies);
    console.log('✅ Upvotes seeded');

    const quizzes = await this.seedQuizzes();
    console.log('✅ Culture Quizzes seeded');

    await this.seedQuizSubmissions(users, quizzes);
    console.log('✅ Quiz Submissions seeded');

    await this.seedAppreciationThreads(posts);
    console.log('✅ Appreciation Threads seeded');

    await this.seedChallenges(threads, posts);
    console.log('✅ Challenges seeded');

    console.log('🎉 Database seeding completed successfully!');
  }

  private async clearDatabase() {
    console.log('🗑️  Clearing existing data...');

    // Use TRUNCATE for faster deletion and to reset sequences
    await this.challengeRepository.query('TRUNCATE TABLE challenges CASCADE');
    await this.appreciationThreadRepository.query(
      'TRUNCATE TABLE appreciation_threads CASCADE',
    );
    await this.quizSubmissionRepository.query(
      'TRUNCATE TABLE culture_quiz_submissions CASCADE',
    );
    await this.quizRepository.query('TRUNCATE TABLE culture_quizzes CASCADE');
    await this.upvoteRepository.query('TRUNCATE TABLE upvotes CASCADE');
    await this.replyRepository.query('TRUNCATE TABLE replies CASCADE');
    await this.postRepository.query('TRUNCATE TABLE posts CASCADE');
    await this.threadUserRepository.query(
      'TRUNCATE TABLE thread_users CASCADE',
    );
    await this.threadRepository.query('TRUNCATE TABLE threads CASCADE');
    await this.buRepository.query('TRUNCATE TABLE bu CASCADE');
    await this.userRepository.query('TRUNCATE TABLE users CASCADE');

    console.log('✅ All tables truncated');
  }

  private async seedUsers(): Promise<User[]> {
    const hashedPassword = await bcrypt.hash('password123', 10);

    const usersData = [
      {
        email: 'sarah.johnson@compass.com',
        password: hashedPassword,
        firstname: 'Sarah',
        lastname: 'Johnson',
        roles: ['admin', 'user'],
        techstack: ['NestJS', 'React', 'PostgreSQL', 'TypeScript', 'Docker'],
        user_roles: ['Engineering Manager', 'Tech Lead'],
        hobbies: ['Rock Climbing', 'Reading Sci-Fi', 'Coffee Tasting'],
        is_active: true,
      },
      {
        email: 'michael.chen@compass.com',
        password: hashedPassword,
        firstname: 'Michael',
        lastname: 'Chen',
        roles: ['user'],
        techstack: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'Redux'],
        user_roles: ['Senior Frontend Developer'],
        hobbies: ['Gaming', 'Photography', 'Cooking Asian Cuisine'],
        is_active: true,
      },
      {
        email: 'emily.rodriguez@compass.com',
        password: hashedPassword,
        firstname: 'Emily',
        lastname: 'Rodriguez',
        roles: ['user'],
        techstack: ['Python', 'Django', 'PostgreSQL', 'Redis', 'Celery'],
        user_roles: ['Senior Backend Developer'],
        hobbies: ['Yoga', 'Traveling', 'Learning Languages'],
        is_active: true,
      },
      {
        email: 'david.patel@compass.com',
        password: hashedPassword,
        firstname: 'David',
        lastname: 'Patel',
        roles: ['user'],
        techstack: ['Vue.js', 'Express', 'MongoDB', 'AWS', 'Jest'],
        user_roles: ['Full Stack Developer'],
        hobbies: ['Cricket', 'Music Production', 'Hiking'],
        is_active: true,
      },
      {
        email: 'jessica.kim@compass.com',
        password: hashedPassword,
        firstname: 'Jessica',
        lastname: 'Kim',
        roles: ['user'],
        techstack: ['React Native', 'Swift', 'Kotlin', 'Flutter', 'Firebase'],
        user_roles: ['Mobile Developer'],
        hobbies: ['Marathon Running', 'Painting', 'Volunteering'],
        is_active: true,
      },
      {
        email: 'alex.thompson@compass.com',
        password: hashedPassword,
        firstname: 'Alex',
        lastname: 'Thompson',
        roles: ['user'],
        techstack: ['DevOps', 'AWS', 'Docker', 'Kubernetes', 'Terraform'],
        user_roles: ['DevOps Engineer'],
        hobbies: ['Cycling', 'Brewing Beer', 'Board Games'],
        is_active: true,
      },
      {
        email: 'maria.garcia@compass.com',
        password: hashedPassword,
        firstname: 'Maria',
        lastname: 'Garcia',
        roles: ['user'],
        techstack: [
          'Figma',
          'Adobe XD',
          'Sketch',
          'Prototyping',
          'User Research',
        ],
        user_roles: ['Product Designer'],
        hobbies: ['Illustration', 'Gardening', 'Podcasts'],
        is_active: true,
      },
      {
        email: 'james.wilson@compass.com',
        password: hashedPassword,
        firstname: 'James',
        lastname: 'Wilson',
        roles: ['user'],
        techstack: ['Product Management', 'Analytics', 'Roadmapping', 'Agile'],
        user_roles: ['Product Manager'],
        hobbies: ['Chess', 'Economics', 'Skiing'],
        is_active: true,
      },
      {
        email: 'olivia.brown@compass.com',
        password: hashedPassword,
        firstname: 'Olivia',
        lastname: 'Brown',
        roles: ['user'],
        techstack: ['Java', 'Spring Boot', 'Microservices', 'Kafka', 'MySQL'],
        user_roles: ['Backend Developer'],
        hobbies: ['Book Club', 'Tennis', 'Baking'],
        is_active: true,
      },
      {
        email: 'ryan.murphy@compass.com',
        password: hashedPassword,
        firstname: 'Ryan',
        lastname: 'Murphy',
        roles: ['user'],
        techstack: ['Angular', 'RxJS', 'SCSS', 'NgRx', 'Cypress'],
        user_roles: ['Frontend Developer'],
        hobbies: ['Soccer', 'Guitar', 'Stand-up Comedy'],
        is_active: true,
      },
      {
        email: 'sophia.martinez@compass.com',
        password: hashedPassword,
        firstname: 'Sophia',
        lastname: 'Martinez',
        roles: ['user'],
        techstack: ['Machine Learning', 'Python', 'TensorFlow', 'Data Science'],
        user_roles: ['Data Scientist'],
        hobbies: ['Astronomy', 'CrossFit', 'Documentary Films'],
        is_active: true,
      },
      {
        email: 'daniel.lee@compass.com',
        password: hashedPassword,
        firstname: 'Daniel',
        lastname: 'Lee',
        roles: ['user'],
        techstack: ['Go', 'gRPC', 'Microservices', 'PostgreSQL', 'Redis'],
        user_roles: ['Backend Engineer'],
        hobbies: ['Photography', 'Drones', 'Martial Arts'],
        is_active: true,
      },
      {
        email: 'amanda.taylor@compass.com',
        password: hashedPassword,
        firstname: 'Amanda',
        lastname: 'Taylor',
        roles: ['user'],
        techstack: ['QA Automation', 'Selenium', 'Playwright', 'Jest', 'CI/CD'],
        user_roles: ['QA Engineer'],
        hobbies: ['Writing', 'Knitting', 'Nature Walks'],
        is_active: true,
      },
      {
        email: 'chris.anderson@compass.com',
        password: hashedPassword,
        firstname: 'Chris',
        lastname: 'Anderson',
        roles: ['user'],
        techstack: ['Security', 'Penetration Testing', 'Cryptography', 'OWASP'],
        user_roles: ['Security Engineer'],
        hobbies: ['Lockpicking', 'Puzzle Solving', 'Fishing'],
        is_active: true,
      },
      {
        email: 'rachel.white@compass.com',
        password: hashedPassword,
        firstname: 'Rachel',
        lastname: 'White',
        roles: ['user'],
        techstack: ['Rust', 'WebAssembly', 'System Programming', 'Performance'],
        user_roles: ['Systems Developer'],
        hobbies: ['Origami', 'Archery', 'Audiobooks'],
        is_active: true,
      },
    ];

    const users = this.userRepository.create(usersData);
    return await this.userRepository.save(users);
  }

  private async assignUsersToBUs(users: User[], bus: Bu[]) {
    // Engineering BU
    users[0].bu_id = bus[0].id; // Sarah
    users[1].bu_id = bus[0].id; // Michael
    users[2].bu_id = bus[0].id; // Emily
    users[3].bu_id = bus[0].id; // David
    users[4].bu_id = bus[0].id; // Jessica
    users[5].bu_id = bus[0].id; // Alex
    users[8].bu_id = bus[0].id; // Olivia
    users[9].bu_id = bus[0].id; // Ryan
    users[11].bu_id = bus[0].id; // Daniel
    users[12].bu_id = bus[0].id; // Amanda
    users[13].bu_id = bus[0].id; // Chris
    users[14].bu_id = bus[0].id; // Rachel

    // Product BU
    users[7].bu_id = bus[1].id; // James

    // Design BU
    users[6].bu_id = bus[2].id; // Maria

    // Data/Analytics BU
    users[10].bu_id = bus[3].id; // Sophia

    await this.userRepository.save(users);
  }

  private async seedBusinessUnits(): Promise<Bu[]> {
    const busData = [
      { name: 'Engineering' },
      { name: 'Product' },
      { name: 'Design' },
      { name: 'Data & Analytics' },
      { name: 'Marketing' },
      { name: 'Operations' },
    ];

    const bus = this.buRepository.create(busData);
    return await this.buRepository.save(bus);
  }

  private async seedThreads(bus: Bu[], users: User[]): Promise<Thread[]> {
    const now = new Date();
    const threadsData = [
      {
        name: 'Welcome & Introductions',
        description:
          'Introduce yourself and get to know the Compass community. Share your background, interests, and what you hope to learn!',
        bu_id: undefined,
        creator_id: users[0].id,
        created_at: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      },
      {
        name: 'Engineering Best Practices',
        description:
          'Share and discuss coding standards, architecture patterns, and engineering excellence',
        bu_id: bus[0].id,
        creator_id: users[0].id,
        created_at: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        name: 'Frontend Frameworks',
        description:
          'Discussions about React, Vue, Angular, and other frontend technologies',
        bu_id: bus[0].id,
        creator_id: users[1].id,
        created_at: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
      },
      {
        name: 'Backend Architecture',
        description:
          'Microservices, APIs, databases, and scalable backend systems',
        bu_id: bus[0].id,
        creator_id: users[2].id,
        created_at: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
      },
      {
        name: 'DevOps & Infrastructure',
        description:
          'CI/CD, containerization, cloud platforms, and deployment strategies',
        bu_id: bus[0].id,
        creator_id: users[5].id,
        created_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        name: 'Product Discovery',
        description:
          'Feature brainstorming, user research insights, and product roadmap discussions',
        bu_id: bus[1].id,
        creator_id: users[7].id,
        created_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        name: 'Design Systems & UI/UX',
        description:
          'Component libraries, design tokens, accessibility, and user experience patterns',
        bu_id: bus[2].id,
        creator_id: users[6].id,
        created_at: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        name: 'Data & Analytics',
        description:
          'Data pipelines, ML models, analytics insights, and data-driven decisions',
        bu_id: bus[3].id,
        creator_id: users[10].id,
        created_at: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        name: 'Security & Privacy',
        description:
          'Application security, threat modeling, compliance, and security best practices',
        bu_id: bus[0].id,
        creator_id: users[13].id,
        created_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        name: 'Mobile Development',
        description:
          'iOS, Android, React Native, Flutter, and cross-platform development',
        bu_id: bus[0].id,
        creator_id: users[4].id,
        created_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        name: 'Coffee & Code',
        description:
          'Casual chat, memes, what you are working on, and everything off-topic',
        bu_id: undefined,
        creator_id: users[1].id,
        created_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        name: 'Learning & Growth',
        description:
          'Share courses, books, tutorials, and resources for professional development',
        bu_id: undefined,
        creator_id: users[7].id,
        created_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
    ];

    const threads = this.threadRepository.create(threadsData);
    return await this.threadRepository.save(threads);
  }

  private async seedThreadUsers(users: User[], threads: Thread[]) {
    const threadUsersData: any[] = [];
    const added = new Set<string>(); // Track added combinations to avoid duplicates

    const addThreadUser = (userId: number, threadId: number, role: string) => {
      const key = `${userId}-${threadId}`;
      if (!added.has(key)) {
        threadUsersData.push({ user_id: userId, thread_id: threadId, role });
        added.add(key);
      }
    };

    // Admin (Sarah) is member of all threads but doesn't post
    threads.forEach((thread) => {
      addThreadUser(users[0].id, thread.id, 'member');
    });

    // Engineering threads - most eng team members
    [1, 2, 3, 4, 5, 8, 9, 11, 12, 13, 14].forEach((userIdx) => {
      [1, 2, 3, 4].forEach((threadIdx) => {
        addThreadUser(users[userIdx].id, threads[threadIdx].id, 'member');
      });
    });

    // Security thread members
    [5, 8, 11, 13].forEach((userIdx) => {
      addThreadUser(users[userIdx].id, threads[8].id, 'member');
    });

    // Mobile thread members
    [1, 3, 4, 9].forEach((userIdx) => {
      addThreadUser(users[userIdx].id, threads[9].id, 'member');
    });

    // Product thread members
    [1, 6, 7, 8].forEach((userIdx) => {
      addThreadUser(users[userIdx].id, threads[5].id, 'member');
    });

    // Design thread members
    [1, 6, 7, 9].forEach((userIdx) => {
      addThreadUser(users[userIdx].id, threads[6].id, 'member');
    });

    // Data & Analytics thread members
    [2, 8, 10, 11].forEach((userIdx) => {
      addThreadUser(users[userIdx].id, threads[7].id, 'member');
    });

    // Everyone except admin in Welcome & Coffee threads
    users.slice(1).forEach((user) => {
      addThreadUser(user.id, threads[0].id, 'member');
      addThreadUser(user.id, threads[10].id, 'member');
    });

    // Learning & Growth thread members
    [1, 2, 3, 7, 8, 10, 12].forEach((userIdx) => {
      addThreadUser(users[userIdx].id, threads[11].id, 'member');
    });

    console.log(`Creating ${threadUsersData.length} thread memberships...`);
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
          "Hi, I'm Michael! I'm a frontend developer working with React and TypeScript. Excited to be part of this community!",
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
          "Hello! I'm Emily, a backend developer specializing in Python and Django. Looking forward to learning from everyone here.",
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
        author_id: users[2].id,
        parent_reply_id: undefined,
        content: 'Welcome to Compass, Michael! Great to have you here!',
        image_urls: [],
        upvote_count: 2,
      },
      {
        post_id: posts[1].id,
        author_id: users[1].id,
        parent_reply_id: undefined,
        content: 'Hi Emily! Looking forward to collaborating with you.',
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
        author_id: users[3].id,
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
        author_id: users[7].id,
        parent_reply_id: undefined,
        content: 'Dark mode is on our roadmap! Should be coming soon.',
        image_urls: [],
        upvote_count: 10,
      },
      {
        post_id: posts[5].id,
        author_id: users[1].id,
        parent_reply_id: undefined,
        content: 'Yes please! My eyes will thank you.',
        image_urls: [],
        upvote_count: 8,
      },
      {
        post_id: posts[7].id,
        author_id: users[1].id,
        parent_reply_id: undefined,
        content: 'Working on a personal blog with Next.js!',
        image_urls: [],
        upvote_count: 3,
      },
      {
        post_id: posts[8].id,
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
      // Post upvotes (no admin upvotes)
      { user_id: users[2].id, post_id: posts[0].id, type: 'post' },
      { user_id: users[3].id, post_id: posts[0].id, type: 'post' },
      { user_id: users[4].id, post_id: posts[0].id, type: 'post' },
      { user_id: users[2].id, post_id: posts[2].id, type: 'post' },
      { user_id: users[3].id, post_id: posts[2].id, type: 'post' },
      { user_id: users[1].id, post_id: posts[3].id, type: 'post' },
      { user_id: users[3].id, post_id: posts[4].id, type: 'post' },
      { user_id: users[1].id, post_id: posts[4].id, type: 'post' },
      { user_id: users[1].id, post_id: posts[5].id, type: 'post' },
      { user_id: users[2].id, post_id: posts[5].id, type: 'post' },
      { user_id: users[3].id, post_id: posts[5].id, type: 'post' },
      // Reply upvotes (no admin upvotes)
      { user_id: users[1].id, reply_id: replies[0].id, type: 'reply' },
      { user_id: users[2].id, reply_id: replies[2].id, type: 'reply' },
      { user_id: users[3].id, reply_id: replies[4].id, type: 'reply' },
      { user_id: users[1].id, reply_id: replies[5].id, type: 'reply' },
      { user_id: users[2].id, reply_id: replies[7].id, type: 'reply' },
    ];

    const upvotes = this.upvoteRepository.create(upvotesData);
    await this.upvoteRepository.save(upvotes);
  }

  private async seedQuizzes(): Promise<CultureQuiz[]> {
    const now = new Date();

    const quizzesData = [
      {
        title: 'Company Values & Culture - Week 1',
        description:
          'Test your knowledge of our company values, mission, and cultural principles',
        is_active: true,
        created_at: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
        questions: [
          {
            question:
              'What is our primary company value when it comes to collaboration?',
            options: [
              'Competition drives excellence',
              'Transparency and open communication',
              'Individual achievement first',
              'Hierarchy ensures order',
            ],
            correctAnswer: 1,
          },
          {
            question: 'How do we approach failure and mistakes in our culture?',
            options: [
              'Failures are learning opportunities',
              'Mistakes should be hidden',
              'Only success matters',
              'Blame the responsible party',
            ],
            correctAnswer: 0,
          },
          {
            question:
              'What does "user-centric" mean in our product development?',
            options: [
              'Users adapt to our product',
              'Features are more important than users',
              'User feedback drives our decisions',
              'Marketing decides what users want',
            ],
            correctAnswer: 2,
          },
          {
            question: 'How do we define work-life balance?',
            options: [
              'Work until the job is done',
              'Flexible hours and trust in our team',
              'Strict 9-5 schedule',
              'Balance is a personal issue',
            ],
            correctAnswer: 1,
          },
          {
            question: 'What is our approach to professional development?',
            options: [
              'Learn on your own time',
              'Only formal training counts',
              'Continuous learning is encouraged and supported',
              'Focus only on current role skills',
            ],
            correctAnswer: 2,
          },
        ],
      },
      {
        title: 'Engineering Excellence - Week 2',
        description:
          'Quiz on our engineering practices, code quality standards, and technical culture',
        is_active: true,
        created_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        questions: [
          {
            question:
              'What is the recommended maximum size for a Pull Request?',
            options: [
              '1000+ lines - big changes are efficient',
              '400 lines or less for easier review',
              '100 lines exactly',
              'Size does not matter',
            ],
            correctAnswer: 1,
          },
          {
            question: 'When should code reviews be completed?',
            options: [
              'Within 24 hours when possible',
              'Whenever convenient',
              'Once a week in batch',
              'Only if you have free time',
            ],
            correctAnswer: 0,
          },
          {
            question: 'What is our stance on automated testing?',
            options: [
              'Optional if you are confident',
              'Only for critical features',
              'Required for all new features',
              'Manual testing is sufficient',
            ],
            correctAnswer: 2,
          },
          {
            question: 'How should technical debt be handled?',
            options: [
              'Ignore it and keep shipping',
              'Track it and allocate time to address it',
              'Only fix if it causes issues',
              'Complete rewrite is the only solution',
            ],
            correctAnswer: 1,
          },
          {
            question: 'What is the purpose of our code style guide?',
            options: [
              'To restrict creativity',
              'Consistency and maintainability',
              'To slow down development',
              'Optional best practices',
            ],
            correctAnswer: 1,
          },
        ],
      },
      {
        title: 'Team Collaboration - Week 3',
        description:
          'Understanding how we work together across teams and departments',
        is_active: false,
        created_at: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        questions: [
          {
            question: 'How do we handle cross-team dependencies?',
            options: [
              'Each team works in silos',
              'Early communication and planning',
              'Escalate to management',
              'Avoid dependencies completely',
            ],
            correctAnswer: 1,
          },
          {
            question:
              'What is the recommended communication channel for quick questions?',
            options: [
              'Always send an email',
              'Schedule a formal meeting',
              'Use Slack/chat for quick sync',
              'Wait for the next standup',
            ],
            correctAnswer: 2,
          },
          {
            question: 'How should conflicts be resolved?',
            options: [
              'Avoid and ignore',
              'Direct, respectful conversation',
              'Let management decide',
              'Vote and majority wins',
            ],
            correctAnswer: 1,
          },
        ],
      },
    ];

    const quizzes = this.quizRepository.create(quizzesData);
    return await this.quizRepository.save(quizzes);
  }

  private async seedQuizSubmissions(users: User[], quizzes: CultureQuiz[]) {
    const now = new Date();
    const submissionsData: any[] = [];

    // Quiz 1 - completed by most users
    const quiz1Users = [0, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12];
    quiz1Users.forEach((userIdx, idx) => {
      const correctAnswers = [1, 0, 2, 1, 2];
      const userAnswers =
        idx < 8
          ? correctAnswers // First 8 pass
          : [1, 0, 2, 0, 1]; // Others get some wrong

      submissionsData.push({
        quiz_id: quizzes[0].id,
        user_id: users[userIdx].id,
        answers: userAnswers,
        score: userAnswers.filter((ans, i) => ans === correctAnswers[i]).length,
        passed:
          userAnswers.filter((ans, i) => ans === correctAnswers[i]).length >= 4,
        created_at: new Date(
          now.getTime() - (5 - Math.floor(idx / 3)) * 24 * 60 * 60 * 1000,
        ),
      });
    });

    // Quiz 2 - completed by some users
    const quiz2Users = [0, 1, 2, 5, 8, 9, 11, 13];
    quiz2Users.forEach((userIdx, idx) => {
      const correctAnswers = [1, 0, 2, 1, 1];
      const userAnswers = idx < 6 ? correctAnswers : [1, 0, 2, 0, 0];

      submissionsData.push({
        quiz_id: quizzes[1].id,
        user_id: users[userIdx].id,
        answers: userAnswers,
        score: userAnswers.filter((ans, i) => ans === correctAnswers[i]).length,
        passed:
          userAnswers.filter((ans, i) => ans === correctAnswers[i]).length >= 4,
        created_at: new Date(
          now.getTime() - (2 - Math.floor(idx / 4)) * 24 * 60 * 60 * 1000,
        ),
      });
    });

    const submissions = this.quizSubmissionRepository.create(submissionsData);
    await this.quizSubmissionRepository.save(submissions);
  }

  private async seedAppreciationThreads(posts: Post[]) {
    const now = new Date();

    // Get the Monday of last week
    const lastWeekMonday = new Date(now);
    lastWeekMonday.setDate(now.getDate() - now.getDay() - 6);
    const weekStart = lastWeekMonday.toISOString().split('T')[0];

    const appreciationData = [
      {
        generated_post_id: posts[1].id, // Use an existing post
        week_start_date: weekStart,
        contributors_data: {
          topContributors: [
            {
              userId: posts[1].author_id,
              name: 'Emily Rodriguez',
              contributions: 15,
              highlights: [
                'Helped review 8 PRs',
                'Mentored junior developers',
                'Fixed critical bug',
              ],
            },
            {
              userId: posts[0].author_id,
              name: 'Michael Chen',
              contributions: 12,
              highlights: [
                'Completed 3 major features',
                'Improved test coverage',
                'Great documentation',
              ],
            },
          ],
          teamMetrics: {
            totalPosts: 45,
            totalReplies: 128,
            activeUsers: 25,
            engagementScore: 8.5,
          },
        },
        generation_status: 'generated',
        is_ai_generated: true,
        created_at: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      },
    ];

    const appreciations =
      this.appreciationThreadRepository.create(appreciationData);
    await this.appreciationThreadRepository.save(appreciations);
  }

  private async seedChallenges(threads: Thread[], posts: Post[]) {
    const now = new Date();

    const challengesData = [
      {
        title: 'November Code Quality Challenge',
        description:
          'Improve code quality metrics across all repositories this month. Focus on: increasing test coverage, reducing technical debt, and improving documentation.',
        challenge_type: 'code_quality',
        thread_id: threads[1].id,
        post_id: undefined,
        start_date: new Date(now.getFullYear(), now.getMonth(), 1),
        end_date: new Date(now.getFullYear(), now.getMonth() + 1, 0),
        status: 'active',
        participation_metrics: {
          participants: 45,
          completedTasks: 127,
          improvementScore: 7.8,
          topPerformers: ['Sarah Johnson', 'Michael Chen', 'Emily Rodriguez'],
        },
        is_ai_generated: false,
        created_at: new Date(now.getFullYear(), now.getMonth(), 1),
      },
      {
        title: 'Weekly Knowledge Sharing',
        description:
          'Share one thing you learned this week in the Learning & Growth thread. It can be a new technology, a productivity tip, or a lesson from a mistake!',
        challenge_type: 'learning',
        thread_id: threads[11].id,
        post_id: undefined,
        start_date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        end_date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        status: 'active',
        participation_metrics: {
          participants: 28,
          posts: 34,
          engagementRate: 82,
        },
        is_ai_generated: true,
        created_at: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'October Hacktoberfest',
        description:
          'Contribute to open source projects and share your experiences. Document your contributions and learnings.',
        challenge_type: 'community',
        thread_id: threads[10].id,
        post_id: undefined,
        start_date: new Date(now.getFullYear(), 9, 1), // October
        end_date: new Date(now.getFullYear(), 9, 31),
        status: 'completed',
        participation_metrics: {
          participants: 18,
          contributions: 42,
          projectsContributedTo: 15,
        },
        is_ai_generated: false,
        created_at: new Date(now.getFullYear(), 9, 1),
      },
    ];

    const challenges = this.challengeRepository.create(challengesData);
    await this.challengeRepository.save(challenges);
  }
}
