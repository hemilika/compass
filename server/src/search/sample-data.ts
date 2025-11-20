// src/domain/sample-data.ts
import { Bu, User, Thread, Post, Reply } from './models';

export const BUS: Bu[] = [
  { id: 1, name: 'Platform Engineering' },
  { id: 2, name: 'Customer Products' },
];

export const USERS: User[] = [
  {
    id: 1,
    email: 'alice@company.com',
    firstname: 'Alice',
    lastname: 'Dev',
    buId: 1,
    roles: ['user'],
    techstack: ['nestjs', 'postgres', 'k8s'],
    userRoles: ['DEV'],
    hobbies: ['cycling'],
    createdAt: new Date('2025-11-18T08:00:00Z'),
  },
  {
    id: 2,
    email: 'bob@company.com',
    firstname: 'Bob',
    lastname: 'Architect',
    buId: 1,
    roles: ['admin'],
    techstack: ['react', 'typescript'],
    userRoles: ['PO'],
    hobbies: ['cars', 'skiing'],
    createdAt: new Date('2025-11-18T08:10:00Z'),
  },
  {
    id: 3,
    email: 'carol@company.com',
    firstname: 'Carol',
    lastname: 'Tester',
    buId: 2,
    roles: ['user'],
    techstack: ['cypress', 'playwright'],
    userRoles: ['QA'],
    hobbies: ['reading'],
    createdAt: new Date('2025-11-18T08:20:00Z'),
  },
  {
    id: 4,
    email: 'dave@company.com',
    firstname: 'Dave',
    lastname: 'EV',
    buId: 2,
    roles: ['user'],
    techstack: ['python', 'data'],
    userRoles: ['DEV'],
    hobbies: ['evs', 'volvo'],
    createdAt: new Date('2025-11-18T08:30:00Z'),
  },
];

export const THREADS: Thread[] = [
  // BU 1: Platform Engineering
  {
    id: 1,
    name: 'NestJS Backend Architecture',
    description:
      'Discuss backend patterns, performance, and architecture for NestJS services.',
    buId: 1,
    createdAt: new Date('2025-11-18T09:00:00Z'),
  },
  {
    id: 2,
    name: 'React Frontend Best Practices',
    description:
      'State management, hooks, and performance tuning for React apps.',
    buId: 1,
    createdAt: new Date('2025-11-18T09:10:00Z'),
  },
  {
    id: 3,
    name: 'Postgres & Database Design',
    description: 'Schema design, indexing, and query optimization in Postgres.',
    buId: 1,
    createdAt: new Date('2025-11-18T09:20:00Z'),
  },

  // BU 2: Customer Products / EV nerds
  {
    id: 4,
    name: 'EV Real World Range',
    description: 'Share real world consumption and range numbers for EVs.',
    buId: 2,
    createdAt: new Date('2025-11-18T09:30:00Z'),
  },
  {
    id: 5,
    name: 'Volvo EX30 Owners',
    description: 'Tips, tricks and issues for Volvo EX30 owners.',
    buId: 2,
    createdAt: new Date('2025-11-18T09:40:00Z'),
  },
];

export const POSTS: Post[] = [
  // === Platform / programming posts ===
  {
    id: 1,
    buId: 1,
    threadId: 1,
    authorId: 1,
    title: 'How to design a search engine with NestJS and Postgres',
    content:
      'We are building a Reddit-like app. I want to implement a search engine using NestJS and Postgres full-text search. Should we start with an inverted index in memory or directly with GIN indexes on tsvector?',
    iconUrl: null,
    imageUrls: null,
    upvoteCount: 12,
    createdAt: new Date('2025-11-18T10:00:00Z'),
    updatedAt: null,
  },
  {
    id: 2,
    buId: 1,
    threadId: 1,
    authorId: 2,
    title: 'NestJS performance tips for high traffic APIs',
    content:
      'What are your best practices for scaling NestJS services? Discussing caching, connection pooling, and database indexing for high traffic APIs.',
    iconUrl: null,
    imageUrls: null,
    upvoteCount: 18,
    createdAt: new Date('2025-11-18T11:00:00Z'),
    updatedAt: null,
  },
  {
    id: 3,
    buId: 1,
    threadId: 3,
    authorId: 1,
    title: 'Postgres full-text search vs custom inverted index',
    content:
      'Comparing Postgres tsvector, tsquery and GIN indexes with a custom in-memory inverted index. Which one would you start with in a hackathon-ready discussion platform?',
    iconUrl: null,
    imageUrls: null,
    upvoteCount: 22,
    createdAt: new Date('2025-11-18T12:00:00Z'),
    updatedAt: null,
  },
  {
    id: 4,
    buId: 1,
    threadId: 2,
    authorId: 3,
    title: 'React and NestJS full stack project structure',
    content:
      'How do you organize a monorepo with a NestJS backend and a React frontend? Sharing ideas about DTO reuse, shared types and ESLint configs.',
    iconUrl: null,
    imageUrls: null,
    upvoteCount: 7,
    createdAt: new Date('2025-11-18T13:00:00Z'),
    updatedAt: null,
  },
  {
    id: 5,
    buId: 1,
    threadId: 2,
    authorId: 2,
    title: 'Best way to manage state in React for large apps',
    content:
      'Comparing Redux, Zustand and Context for complex dashboards. How do you structure slices and hooks in production code?',
    iconUrl: null,
    imageUrls: null,
    upvoteCount: 10,
    createdAt: new Date('2025-11-18T14:00:00Z'),
    updatedAt: null,
  },

  // === EV / Volvo posts ===
  {
    id: 6,
    buId: 2,
    threadId: 4,
    authorId: 4,
    title: 'Real world range of small electric SUVs',
    content:
      'Share your real world range numbers for Volvo EX30, Hyundai Kona, Kia Niro and Tesla Model Y in winter and summer conditions.',
    iconUrl: null,
    imageUrls: null,
    upvoteCount: 15,
    createdAt: new Date('2025-11-18T15:00:00Z'),
    updatedAt: null,
  },
  {
    id: 7,
    buId: 2,
    threadId: 5,
    authorId: 4,
    title: 'Volvo EX30 winter range tips',
    content:
      'Talking about preconditioning, tire choice and highway speed to improve winter range on the EX30. What charging patterns do you use?',
    iconUrl: null,
    imageUrls: null,
    upvoteCount: 25,
    createdAt: new Date('2025-11-18T16:00:00Z'),
    updatedAt: null,
  },
  {
    id: 8,
    buId: 2,
    threadId: 4,
    authorId: 2,
    title: 'Tesla Model 3 vs Volvo EX30 for commuting',
    content:
      'Comparing consumption, charging speed and comfort between the Model 3 and the EX30 in daily commuting scenarios.',
    iconUrl: null,
    imageUrls: null,
    upvoteCount: 30,
    createdAt: new Date('2025-11-18T17:00:00Z'),
    updatedAt: null,
  },
  {
    id: 9,
    buId: 2,
    threadId: 4,
    authorId: 3,
    title: 'Do winter tires affect EV consumption?',
    content:
      'Discussion about how winter tires, temperature and driving style impact energy consumption and real world range on EVs.',
    iconUrl: null,
    imageUrls: null,
    upvoteCount: 8,
    createdAt: new Date('2025-11-18T18:00:00Z'),
    updatedAt: null,
  },
];

export const REPLIES: Reply[] = [
  // Replies on search / NestJS posts
  {
    id: 1,
    postId: 1,
    authorId: 2,
    parentReplyId: null,
    content:
      'For a hackathon, I would start with a simple in-memory inverted index and then switch to Postgres full-text search once the schema stabilizes.',
    imageUrls: null,
    upvoteCount: 5,
    createdAt: new Date('2025-11-18T10:15:00Z'),
    updatedAt: null,
  },
  {
    id: 2,
    postId: 1,
    authorId: 3,
    parentReplyId: 1,
    content:
      'Agree, start simple. But design your search endpoint in a way that you can swap the implementation later without changing the API.',
    imageUrls: null,
    upvoteCount: 3,
    createdAt: new Date('2025-11-18T10:25:00Z'),
    updatedAt: null,
  },
  {
    id: 3,
    postId: 3,
    authorId: 4,
    parentReplyId: null,
    content:
      'Postgres GIN indexes on tsvector are surprisingly fast. You can still keep a small in-memory index for advanced ranking if needed.',
    imageUrls: null,
    upvoteCount: 4,
    createdAt: new Date('2025-11-18T12:15:00Z'),
    updatedAt: null,
  },
  {
    id: 4,
    postId: 4,
    authorId: 1,
    parentReplyId: null,
    content:
      'We use a monorepo with shared DTOs between React and NestJS using TypeScript project references. It works quite well.',
    imageUrls: null,
    upvoteCount: 2,
    createdAt: new Date('2025-11-18T13:30:00Z'),
    updatedAt: null,
  },

  // Replies on EV / Volvo posts
  {
    id: 5,
    postId: 6,
    authorId: 4,
    parentReplyId: null,
    content:
      'In my Volvo EX30, I see around 260 km real world range in winter on mixed driving, and about 330 km in summer.',
    imageUrls: null,
    upvoteCount: 6,
    createdAt: new Date('2025-11-18T15:30:00Z'),
    updatedAt: null,
  },
  {
    id: 6,
    postId: 7,
    authorId: 2,
    parentReplyId: null,
    content:
      'Preheating the battery and cabin before departure really helps winter range on the EX30, especially for short trips.',
    imageUrls: null,
    upvoteCount: 7,
    createdAt: new Date('2025-11-18T16:30:00Z'),
    updatedAt: null,
  },
  {
    id: 7,
    postId: 7,
    authorId: 3,
    parentReplyId: 6,
    content:
      'Also try to keep highway speed below 120 km/h, the consumption increases a lot above that.',
    imageUrls: null,
    upvoteCount: 4,
    createdAt: new Date('2025-11-18T16:45:00Z'),
    updatedAt: null,
  },
  {
    id: 8,
    postId: 8,
    authorId: 1,
    parentReplyId: null,
    content:
      'For commuting, the Tesla Supercharger network is a big plus, but the EX30 is easier to park in tight city streets.',
    imageUrls: null,
    upvoteCount: 5,
    createdAt: new Date('2025-11-18T17:30:00Z'),
    updatedAt: null,
  },
  {
    id: 9,
    postId: 9,
    authorId: 4,
    parentReplyId: null,
    content:
      'Winter tires definitely increase EV consumption, but the extra grip and safety in snow and ice are worth it.',
    imageUrls: null,
    upvoteCount: 3,
    createdAt: new Date('2025-11-18T18:30:00Z'),
    updatedAt: null,
  },
];
