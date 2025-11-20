import { api } from "@/lib/httpClient";
import type {
  User,
  BusinessUnit,
  Thread,
  Post,
  Reply,
  Upvote,
  SignupRequest,
  LoginRequest,
  LoginResponse,
  CreatePostRequest,
  UpdatePostRequest,
  CreateThreadRequest,
  UpdateThreadRequest,
  CreateReplyRequest,
  UpdateReplyRequest,
  UpdateUserRequest,
  CreateBuRequest,
  UpdateBuRequest,
  SearchQueryParams,
  SearchResponse,
  AiSearchRequest,
  AiSearchResponse,
} from "@/types/api";

// Auth API
export const authApi = {
  signup: async (data: SignupRequest): Promise<LoginResponse> => {
    return api.post<LoginResponse, SignupRequest>("/auth/signup", data);
  },

  login: async (data: LoginRequest): Promise<LoginResponse> => {
    return api.post<LoginResponse, LoginRequest>("/auth/login", data);
  },
};

// Users API
export const usersApi = {
  getAll: async (): Promise<User[]> => {
    return api.get<User[]>("/users");
  },

  getById: async (id: number): Promise<User> => {
    return api.get<User>(`/users/${id}`);
  },

  getProfile: async (): Promise<User> => {
    return api.get<User>("/users/me/profile");
  },

  update: async (id: number, data: UpdateUserRequest): Promise<User> => {
    return api.patch<User, UpdateUserRequest>(`/users/${id}`, data);
  },

  deactivate: async (id: number): Promise<User> => {
    return api.patch<User>(`/users/${id}/deactivate`);
  },

  activate: async (id: number): Promise<User> => {
    return api.patch<User>(`/users/${id}/activate`);
  },

  delete: async (id: number): Promise<void> => {
    return api.delete<void>(`/users/${id}`);
  },
};

// Business Units API
export const buApi = {
  getAll: async (): Promise<BusinessUnit[]> => {
    return api.get<BusinessUnit[]>("/bu");
  },

  getById: async (id: number): Promise<BusinessUnit> => {
    return api.get<BusinessUnit>(`/bu/${id}`);
  },

  create: async (data: CreateBuRequest): Promise<BusinessUnit> => {
    return api.post<BusinessUnit, CreateBuRequest>("/bu", data);
  },

  update: async (id: number, data: UpdateBuRequest): Promise<BusinessUnit> => {
    return api.patch<BusinessUnit, UpdateBuRequest>(`/bu/${id}`, data);
  },

  delete: async (id: number): Promise<void> => {
    return api.delete<void>(`/bu/${id}`);
  },
};

// Threads API
export const threadsApi = {
  getAll: async (): Promise<Thread[]> => {
    return api.get<Thread[]>("/threads");
  },

  getById: async (id: number): Promise<Thread> => {
    return api.get<Thread>(`/threads/${id}`);
  },

  create: async (data: CreateThreadRequest): Promise<Thread> => {
    return api.post<Thread, CreateThreadRequest>("/threads", data);
  },

  update: async (id: number, data: UpdateThreadRequest): Promise<Thread> => {
    return api.patch<Thread, UpdateThreadRequest>(`/threads/${id}`, data);
  },

  delete: async (id: number): Promise<void> => {
    return api.delete<void>(`/threads/${id}`);
  },

  join: async (threadId: number): Promise<void> => {
    return api.post<void>(`/threads/${threadId}/join`);
  },

  leave: async (threadId: number): Promise<void> => {
    return api.delete<void>(`/threads/${threadId}/leave`);
  },
};

// Posts API
export const postsApi = {
  getAll: async (threadId?: number): Promise<Post[]> => {
    const params = threadId ? { threadId: threadId.toString() } : undefined;
    return api.get<Post[]>("/posts", params);
  },

  getById: async (id: number): Promise<Post> => {
    return api.get<Post>(`/posts/${id}`);
  },

  create: async (data: CreatePostRequest): Promise<Post> => {
    return api.post<Post, CreatePostRequest>("/posts", data);
  },

  update: async (id: number, data: UpdatePostRequest): Promise<Post> => {
    return api.patch<Post, UpdatePostRequest>(`/posts/${id}`, data);
  },

  delete: async (id: number): Promise<void> => {
    return api.delete<void>(`/posts/${id}`);
  },
};

// Replies API
export const repliesApi = {
  getByPost: async (postId: number): Promise<Reply[]> => {
    return api.get<Reply[]>("/replies", { postId: postId.toString() });
  },

  getById: async (id: number): Promise<Reply> => {
    return api.get<Reply>(`/replies/${id}`);
  },

  create: async (data: CreateReplyRequest): Promise<Reply> => {
    return api.post<Reply, CreateReplyRequest>("/replies", data);
  },

  update: async (id: number, data: UpdateReplyRequest): Promise<Reply> => {
    return api.patch<Reply, UpdateReplyRequest>(`/replies/${id}`, data);
  },

  delete: async (id: number): Promise<void> => {
    return api.delete<void>(`/replies/${id}`);
  },
};

// Upvotes API
export const upvotesApi = {
  upvotePost: async (postId: number): Promise<Upvote> => {
    return api.post<Upvote>(`/upvotes/posts/${postId}`);
  },

  removePostUpvote: async (postId: number): Promise<void> => {
    return api.delete<void>(`/upvotes/posts/${postId}`);
  },

  upvoteReply: async (replyId: number): Promise<Upvote> => {
    return api.post<Upvote>(`/upvotes/replies/${replyId}`);
  },

  removeReplyUpvote: async (replyId: number): Promise<void> => {
    return api.delete<void>(`/upvotes/replies/${replyId}`);
  },

  getMyUpvotes: async (): Promise<Upvote[]> => {
    return api.get<Upvote[]>("/upvotes/me");
  },
};

// Search API
export const searchApi = {
  search: async (params: SearchQueryParams): Promise<SearchResponse> => {
    const queryParams: Record<string, string> = {
      query: params.query,
    };
    if (params.type) queryParams.type = params.type;
    if (params.match) queryParams.match = params.match;
    if (params.buId) queryParams.buId = params.buId.toString();
    if (params.threadId) queryParams.threadId = params.threadId.toString();
    if (params.sort) queryParams.sort = params.sort;
    if (params.page) queryParams.page = params.page.toString();
    if (params.limit) queryParams.limit = params.limit.toString();

    return api.get<SearchResponse>("/search", queryParams);
  },

  aiSearch: async (data: AiSearchRequest): Promise<AiSearchResponse> => {
    return api.post<AiSearchResponse, AiSearchRequest>("/search/ai", data);
  },
};

