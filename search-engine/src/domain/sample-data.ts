import { Category, Post, Message } from './models';

export const CATEGORIES: Category[] = [
  // Top-level
  { id: 'cat_programming', name: 'Programming', parentId: null },
  { id: 'cat_cars', name: 'Cars', parentId: null },

  // Programming subcategories
  { id: 'cat_nest', name: 'NestJS', parentId: 'cat_programming' },
  { id: 'cat_react', name: 'React', parentId: 'cat_programming' },
  { id: 'cat_databases', name: 'Databases', parentId: 'cat_programming' },

  // Cars subcategories
  { id: 'cat_ev', name: 'Electric vehicles', parentId: 'cat_cars' },
  { id: 'cat_volvo', name: 'Volvo', parentId: 'cat_ev' },
  { id: 'cat_tesla', name: 'Tesla', parentId: 'cat_ev' },
];

export const POSTS: Post[] = [
  // === Original posts ===
  {
    id: 'post_1',
    categoryId: 'cat_nest',
    authorId: 'user_1',
    title: 'How to build a search engine with NestJS?',
    body: 'I want to implement a simple search engine using Nest and Postgres in a Reddit-like app.',
    score: 12,
    createdAt: new Date('2025-11-18T10:00:00Z'),
  },
  {
    id: 'post_2',
    categoryId: 'cat_react',
    authorId: 'user_2',
    title: 'Best way to manage state in React for large apps?',
    body: 'Comparing Redux, Zustand and Context for complex dashboards.',
    score: 7,
    createdAt: new Date('2025-11-18T11:00:00Z'),
  },
  {
    id: 'post_3',
    categoryId: 'cat_cars',
    authorId: 'user_3',
    title: 'Volvo EX30 real world range discussion',
    body: 'Sharing experiences with winter driving, consumption and charging times.',
    score: 20,
    createdAt: new Date('2025-11-18T12:00:00Z'),
  },

  // === New programming-related posts ===
  {
    id: 'post_4',
    categoryId: 'cat_nest',
    authorId: 'user_4',
    title: 'NestJS performance tips for high traffic APIs',
    body: 'Discussing caching, database indexing, and horizontal scaling for NestJS services.',
    score: 15,
    createdAt: new Date('2025-11-18T13:00:00Z'),
  },
  {
    id: 'post_5',
    categoryId: 'cat_databases',
    authorId: 'user_1',
    title: 'Postgres full-text search vs custom inverted index',
    body: 'Comparing Postgres tsvector, tsquery and GIN indexes with an in-memory inverted index approach.',
    score: 18,
    createdAt: new Date('2025-11-18T14:30:00Z'),
  },
  {
    id: 'post_6',
    categoryId: 'cat_react',
    authorId: 'user_5',
    title: 'React and NestJS full stack project structure',
    body: 'How to organize a monorepo with a NestJS backend and a React frontend, sharing types and DTOs.',
    score: 9,
    createdAt: new Date('2025-11-18T15:15:00Z'),
  },

  // === New car / EV-related posts ===
  {
    id: 'post_7',
    categoryId: 'cat_volvo',
    authorId: 'user_2',
    title: 'Volvo EX30 winter range tips',
    body: 'Talking about preconditioning, tire choice and speed to improve winter range on the EX30.',
    score: 25,
    createdAt: new Date('2025-11-18T16:00:00Z'),
  },
  {
    id: 'post_8',
    categoryId: 'cat_tesla',
    authorId: 'user_3',
    title: 'Tesla Model 3 vs Volvo EX30 for daily commuting',
    body: 'Comparing consumption, charging speed and comfort between the Model 3 and the EX30.',
    score: 30,
    createdAt: new Date('2025-11-18T17:00:00Z'),
  },
  {
    id: 'post_9',
    categoryId: 'cat_ev',
    authorId: 'user_6',
    title: 'Real world range of small electric SUVs',
    body: 'Including Volvo EX30, Hyundai Kona, Kia Niro and Tesla Model Y in mixed city and highway driving.',
    score: 10,
    createdAt: new Date('2025-11-18T18:00:00Z'),
  },
  {
    id: 'post_10',
    categoryId: 'cat_cars',
    authorId: 'user_7',
    title: 'Do winter tires affect EV consumption?',
    body: 'Discussion about how winter tires, temperature and driving style impact range and energy use.',
    score: 5,
    createdAt: new Date('2025-11-18T19:00:00Z'),
  },
];

export const MESSAGES: Message[] = [
  // === Original messages ===
  {
    id: 'msg_1',
    postId: 'post_1',
    parentMessageId: null,
    authorId: 'user_2',
    body: 'You can start with a simple inverted index in memory, then move to Postgres full text.',
    createdAt: new Date('2025-11-18T10:30:00Z'),
  },
  {
    id: 'msg_2',
    postId: 'post_3',
    parentMessageId: null,
    authorId: 'user_1',
    body: 'In cold weather the Volvo EX30 loses some range, but charging is still decent.',
    createdAt: new Date('2025-11-18T12:30:00Z'),
  },

  // === New messages on programming posts ===
  {
    id: 'msg_3',
    postId: 'post_1',
    parentMessageId: 'msg_1',
    authorId: 'user_3',
    body: 'Full text search in Postgres with tsvector is usually enough before you add a dedicated search engine.',
    createdAt: new Date('2025-11-18T10:45:00Z'),
  },
  {
    id: 'msg_4',
    postId: 'post_5',
    parentMessageId: null,
    authorId: 'user_4',
    body: 'I like combining Postgres full-text search for basic queries with an external inverted index for advanced features.',
    createdAt: new Date('2025-11-18T14:45:00Z'),
  },
  {
    id: 'msg_5',
    postId: 'post_5',
    parentMessageId: 'msg_4',
    authorId: 'user_1',
    body: 'Same here, especially when I need ranking that boosts recent posts and popular content.',
    createdAt: new Date('2025-11-18T15:00:00Z'),
  },
  {
    id: 'msg_6',
    postId: 'post_6',
    parentMessageId: null,
    authorId: 'user_2',
    body: 'Sharing DTOs between React and NestJS helps keep the types in sync and avoid silly bugs.',
    createdAt: new Date('2025-11-18T15:30:00Z'),
  },

  // === New messages on EV / car posts ===
  {
    id: 'msg_7',
    postId: 'post_7',
    parentMessageId: null,
    authorId: 'user_5',
    body: 'Preheating the battery and cabin on the Volvo EX30 before driving really helps winter range.',
    createdAt: new Date('2025-11-18T16:30:00Z'),
  },
  {
    id: 'msg_8',
    postId: 'post_7',
    parentMessageId: 'msg_7',
    authorId: 'user_3',
    body: 'Also try to keep highway speed below 120 km/h, the consumption increases a lot above that.',
    createdAt: new Date('2025-11-18T16:45:00Z'),
  },
  {
    id: 'msg_9',
    postId: 'post_8',
    parentMessageId: null,
    authorId: 'user_1',
    body: 'For daily commuting, the Tesla Supercharger network is a plus, but the EX30 is easier to park in the city.',
    createdAt: new Date('2025-11-18T17:15:00Z'),
  },
  {
    id: 'msg_10',
    postId: 'post_9',
    parentMessageId: null,
    authorId: 'user_7',
    body: 'Real world range depends a lot on winter temperatures, elevation and how often you fast charge.',
    createdAt: new Date('2025-11-18T18:15:00Z'),
  },
  {
    id: 'msg_11',
    postId: 'post_10',
    parentMessageId: null,
    authorId: 'user_6',
    body: 'Winter tires definitely increase consumption a bit, but the safety in snow and ice is worth it.',
    createdAt: new Date('2025-11-18T19:15:00Z'),
  },
  {
    id: 'msg_12',
    postId: 'post_10',
    parentMessageId: 'msg_11',
    authorId: 'user_3',
    body: 'On my EV I see around 10-15% higher consumption when I switch to winter tires.',
    createdAt: new Date('2025-11-18T19:30:00Z'),
  },
];
