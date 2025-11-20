// API Types based on server entities and DTOs

export interface User {
  id: number;
  email: string;
  firstname?: string;
  lastname?: string;
  roles: string[];
  techstack: string[];
  user_roles: string[];
  hobbies: string[];
  bu_id?: number;
  is_active: boolean;
  created_at: string;
  bu?: BusinessUnit;
}

export interface BusinessUnit {
  id: number | string;
  name: string;
  description?: string;
  users?: User[];
  threads?: Thread[];
}

export interface Thread {
  id: number;
  name: string;
  description?: string;
  bu_id?: number;
  created_at: string;
  bu?: BusinessUnit;
  threadUsers?: ThreadUser[];
  member_count?: number; // Added for recommended threads API response
  isJoined?: boolean; // Added for recommended threads API response
}

export interface ThreadUser {
  id: number;
  thread_id: number;
  user_id: number;
  role: "member" | "moderator";
  user?: User;
  thread?: Thread;
}

export interface Post {
  id: number;
  thread_id: number;
  bu_id?: number;
  author_id: number;
  title: string;
  content: string;
  icon_url?: string;
  image_urls: string[];
  upvote_count: number;
  created_at: string;
  updated_at?: string;
  author?: User;
  thread?: Thread;
  bu?: BusinessUnit;
  replies?: Reply[];
}

export interface Reply {
  id: number;
  post_id: number;
  author_id: number;
  parent_reply_id?: number;
  content: string;
  image_urls: string[];
  upvote_count: number;
  created_at: string;
  updated_at?: string;
  author?: User;
  post?: Post;
  parentReply?: Reply;
  childReplies?: Reply[];
}

export interface Upvote {
  id: number;
  user_id: number;
  type: string;
  post_id?: number;
  reply_id?: number;
  created_at: string;
}

// Request DTOs
export interface SignupRequest {
  email: string;
  password: string;
  firstname?: string;
  lastname?: string;
  bu_id?: number;
  techstack?: string[];
  user_roles?: string[];
  hobbies?: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface CreatePostRequest {
  thread_id: number;
  bu_id?: number;
  title: string;
  content: string;
  icon_url?: string;
  image_urls?: string[];
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
  image_urls?: string[];
}

export interface CreateThreadRequest {
  name: string;
  description?: string;
  bu_id?: number;
}

export interface UpdateThreadRequest {
  name?: string;
  description?: string;
}

export interface CreateReplyRequest {
  post_id: number;
  parent_reply_id?: number;
  content: string;
  image_urls?: string[];
}

export interface UpdateReplyRequest {
  content?: string;
  image_urls?: string[];
}

export interface UpdateUserRequest {
  email?: string;
  firstname?: string;
  lastname?: string;
  password?: string;
  techstack?: string[];
  user_roles?: string[];
  hobbies?: string[];
}

export interface CreateBuRequest {
  name: string;
}

export interface UpdateBuRequest {
  name: string;
}

// Search Types
export interface SearchQueryParams {
  query: string;
  type?: "post" | "reply";
  match?: "or" | "and" | "exact";
  buId?: number;
  threadId?: number;
  sort?: "relevance" | "new" | "top";
  page?: number;
  limit?: number;
}

export interface SearchResult {
  id: string;
  type: "post" | "reply";
  buId?: number | null;
  threadId?: number | null;
  threadName?: string | null;
  buName?: string | null;
  postId: number;
  title?: string;
  createdAt: string;
  score: number;
  relevance: number;
  snippet: string;
}

export interface SearchResponse {
  total: number;
  page: number;
  limit: number;
  results: SearchResult[];
}

export interface AiSearchRequest {
  query: string;
  conversationHistory?: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
  buId?: number;
  threadId?: number;
}

export interface AiSearchSource {
  id: string;
  type: "post" | "reply";
  postId: number;
  threadId: number | null;
  threadName: string | null;
  buId: number | null;
  buName: string | null;
  title?: string;
  snippet: string;
  url: string;
  authorName: string;
  upvoteCount: number;
  createdAt: string;
  relevanceScore: number;
}

export interface AiSearchResponse {
  answer: string;
  sources: AiSearchSource[];
  suggestedFollowups: string[];
  metadata: {
    totalSources: number;
    modelUsed: string;
    queryProcessedAt: string;
  };
}

// Quiz Types
export interface QuizQuestion {
  question: string;
  alternatives: string[];
}

export interface Quiz {
  id: number;
  title: string;
  description: string;
  questions: QuizQuestion[];
  createdAt: Date;
}

export interface QuizSubmission {
  quizId: number;
  answers: number[]; // array of selected answer indices
}

export interface QuizResult {
  quizId: number;
  score: number;
  totalQuestions: number;
  passed: boolean;
  correctAnswers: number[];
}

export interface QuizSubmissionHistory {
  id: number;
  quiz_id: number;
  user_id: number;
  answers: number[];
  score: number;
  passed: boolean;
  created_at: string;
  quiz?: Quiz;
  user?: User;
}

export interface QuizLeaderboardEntry {
  id: number;
  quiz_id: number;
  user_id: number;
  answers: number[];
  score: number;
  passed: boolean;
  created_at: string;
  user: User;
}

// Weekly Contributors Types
export interface WeeklyContributor {
  userId: number;
  firstname: string;
  lastname: string;
  postCount: number;
  replyCount: number;
  totalUpvotes: number;
}

// Weekly Moderators Types
export interface WeeklyModerator {
  userId: number;
  firstname: string;
  lastname: string;
  email: string;
  threadCount: number;
  threads: Array<{
    threadId: number;
    threadName: string;
  }>;
}

// Weekly Top Posts Types
export interface WeeklyTopPost {
  id: number;
  title: string;
  upvotes: number;
  replies: number;
}

export interface WeeklyAnalytics {
  topPosts: WeeklyTopPost[];
  totalUpvotes: number;
}
