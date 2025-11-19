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
  id: number;
  name: string;
}

export interface Thread {
  id: number;
  name: string;
  description?: string;
  bu_id?: number;
  created_at: string;
  bu?: BusinessUnit;
  threadUsers?: ThreadUser[];
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

export interface AddUserToThreadRequest {
  role: "member" | "moderator";
}
