import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/lib/httpClient";
import {
  authApi,
  usersApi,
  buApi,
  threadsApi,
  postsApi,
  repliesApi,
  upvotesApi,
} from "@/services/api";
import type {
  SignupRequest,
  LoginRequest,
  CreatePostRequest,
  UpdatePostRequest,
  CreateThreadRequest,
  UpdateThreadRequest,
  CreateReplyRequest,
  UpdateReplyRequest,
  UpdateUserRequest,
  CreateBuRequest,
  UpdateBuRequest,
} from "@/types/api";

// Query Keys
export const queryKeys = {
  users: {
    all: ["users"] as const,
    lists: () => [...queryKeys.users.all, "list"] as const,
    list: (filters: string) =>
      [...queryKeys.users.lists(), { filters }] as const,
    details: () => [...queryKeys.users.all, "detail"] as const,
    detail: (id: number) => [...queryKeys.users.details(), id] as const,
    profile: () => [...queryKeys.users.all, "profile"] as const,
  },
  bu: {
    all: ["bu"] as const,
    lists: () => [...queryKeys.bu.all, "list"] as const,
    details: () => [...queryKeys.bu.all, "detail"] as const,
    detail: (id: number) => [...queryKeys.bu.details(), id] as const,
  },
  threads: {
    all: ["threads"] as const,
    lists: () => [...queryKeys.threads.all, "list"] as const,
    details: () => [...queryKeys.threads.all, "detail"] as const,
    detail: (id: number) => [...queryKeys.threads.details(), id] as const,
  },
  posts: {
    all: ["posts"] as const,
    lists: () => [...queryKeys.posts.all, "list"] as const,
    list: (threadId?: number) =>
      [...queryKeys.posts.lists(), { threadId }] as const,
    details: () => [...queryKeys.posts.all, "detail"] as const,
    detail: (id: number) => [...queryKeys.posts.details(), id] as const,
  },
  replies: {
    all: ["replies"] as const,
    lists: () => [...queryKeys.replies.all, "list"] as const,
    list: (postId: number) =>
      [...queryKeys.replies.lists(), { postId }] as const,
    details: () => [...queryKeys.replies.all, "detail"] as const,
    detail: (id: number) => [...queryKeys.replies.details(), id] as const,
  },
  upvotes: {
    all: ["upvotes"] as const,
    mine: () => [...queryKeys.upvotes.all, "mine"] as const,
  },
};

// Auth Hooks
export const useLogin = () => {
  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onError: (error: ApiError) => {
      toast.error(error.message || "Login failed");
    },
  });
};

export const useSignup = () => {
  return useMutation({
    mutationFn: (data: SignupRequest) => authApi.signup(data),
    onError: (error: ApiError) => {
      toast.error(error.message || "Signup failed");
    },
  });
};

// Users Hooks
export const useUsers = () => {
  return useQuery({
    queryKey: queryKeys.users.lists(),
    queryFn: async () => {
      try {
        return await usersApi.getAll();
      } catch (error) {
        const apiError = error as ApiError;
        toast.error(apiError.message || "Failed to fetch users");
        throw error;
      }
    },
  });
};

export const useUser = (id: number) => {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: async () => {
      try {
        return await usersApi.getById(id);
      } catch (error) {
        const apiError = error as ApiError;
        toast.error(apiError.message || "Failed to fetch user");
        throw error;
      }
    },
    enabled: !!id,
  });
};

export const useUserProfile = () => {
  return useQuery({
    queryKey: queryKeys.users.profile(),
    queryFn: async () => {
      try {
        return await usersApi.getProfile();
      } catch (error) {
        const apiError = error as ApiError;
        toast.error(apiError.message || "Failed to fetch profile");
        throw error;
      }
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserRequest }) =>
      usersApi.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.profile() });
      toast.success("Profile updated successfully");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to update profile");
    },
  });
};

// Business Units Hooks
export const useBusinessUnits = () => {
  return useQuery({
    queryKey: queryKeys.bu.lists(),
    queryFn: async () => {
      try {
        return await buApi.getAll();
      } catch (error) {
        const apiError = error as ApiError;
        toast.error(apiError.message || "Failed to fetch business units");
        throw error;
      }
    },
  });
};

export const useBusinessUnit = (id: number) => {
  return useQuery({
    queryKey: queryKeys.bu.detail(id),
    queryFn: async () => {
      try {
        return await buApi.getById(id);
      } catch (error) {
        const apiError = error as ApiError;
        toast.error(apiError.message || "Failed to fetch business unit");
        throw error;
      }
    },
    enabled: !!id,
  });
};

export const useCreateBusinessUnit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBuRequest) => buApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bu.lists() });
      toast.success("Business unit created successfully");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to create business unit");
    },
  });
};

export const useUpdateBusinessUnit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateBuRequest }) =>
      buApi.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.bu.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.bu.lists() });
      toast.success("Business unit updated successfully");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to update business unit");
    },
  });
};

// Threads Hooks
export const useThreads = () => {
  return useQuery({
    queryKey: queryKeys.threads.lists(),
    queryFn: async () => {
      try {
        return await threadsApi.getAll();
      } catch (error) {
        const apiError = error as ApiError;
        toast.error(apiError.message || "Failed to fetch threads");
        throw error;
      }
    },
  });
};

export const useThread = (id: number) => {
  return useQuery({
    queryKey: queryKeys.threads.detail(id),
    queryFn: async () => {
      try {
        return await threadsApi.getById(id);
      } catch (error) {
        const apiError = error as ApiError;
        toast.error(apiError.message || "Failed to fetch thread");
        throw error;
      }
    },
    enabled: !!id,
  });
};

export const useCreateThread = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateThreadRequest) => threadsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.threads.lists() });
      toast.success("Thread created successfully");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to create thread");
    },
  });
};

export const useUpdateThread = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateThreadRequest }) =>
      threadsApi.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.threads.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.threads.lists() });
      toast.success("Thread updated successfully");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to update thread");
    },
  });
};

// Posts Hooks
export const usePosts = (threadId?: number) => {
  return useQuery({
    queryKey: queryKeys.posts.list(threadId),
    queryFn: async () => {
      try {
        return await postsApi.getAll(threadId);
      } catch (error) {
        const apiError = error as ApiError;
        toast.error(apiError.message || "Failed to fetch posts");
        throw error;
      }
    },
  });
};

export const usePost = (id: number) => {
  return useQuery({
    queryKey: queryKeys.posts.detail(id),
    queryFn: async () => {
      try {
        return await postsApi.getById(id);
      } catch (error) {
        const apiError = error as ApiError;
        toast.error(apiError.message || "Failed to fetch post");
        throw error;
      }
    },
    enabled: !!id,
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePostRequest) => postsApi.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.list(data.thread_id),
      });
      toast.success("Post created successfully");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to create post");
    },
  });
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePostRequest }) =>
      postsApi.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() });
      toast.success("Post updated successfully");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to update post");
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => postsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() });
      toast.success("Post deleted successfully");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to delete post");
    },
  });
};

// Replies Hooks
export const useReplies = (postId: number) => {
  return useQuery({
    queryKey: queryKeys.replies.list(postId),
    queryFn: async () => {
      try {
        return await repliesApi.getByPost(postId);
      } catch (error) {
        const apiError = error as ApiError;
        toast.error(apiError.message || "Failed to fetch replies");
        throw error;
      }
    },
    enabled: !!postId,
  });
};

export const useReply = (id: number) => {
  return useQuery({
    queryKey: queryKeys.replies.detail(id),
    queryFn: async () => {
      try {
        return await repliesApi.getById(id);
      } catch (error) {
        const apiError = error as ApiError;
        toast.error(apiError.message || "Failed to fetch reply");
        throw error;
      }
    },
    enabled: !!id,
  });
};

export const useCreateReply = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateReplyRequest) => repliesApi.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.replies.list(data.post_id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.detail(data.post_id),
      });
      toast.success("Reply created successfully");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to create reply");
    },
  });
};

export const useUpdateReply = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateReplyRequest }) =>
      repliesApi.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.replies.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.replies.lists() });
      toast.success("Reply updated successfully");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to update reply");
    },
  });
};

export const useDeleteReply = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => repliesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.replies.lists() });
      toast.success("Reply deleted successfully");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to delete reply");
    },
  });
};

// Upvotes Hooks - with idempotency
export const useUpvotePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: number) => upvotesApi.upvotePost(postId),
    onSuccess: (_data, postId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.detail(postId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.upvotes.mine() });
    },
    onError: (error: ApiError) => {
      // Silently handle duplicate upvote errors (idempotency)
      if (error.status !== 400 && error.status !== 409) {
        toast.error(error.message || "Failed to upvote post");
      }
    },
  });
};

export const useRemovePostUpvote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: number) => upvotesApi.removePostUpvote(postId),
    onSuccess: (_data, postId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.detail(postId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.upvotes.mine() });
    },
    onError: (error: ApiError) => {
      // Silently handle if upvote doesn't exist
      if (error.status !== 404) {
        toast.error(error.message || "Failed to remove upvote");
      }
    },
  });
};

export const useUpvoteReply = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (replyId: number) => upvotesApi.upvoteReply(replyId),
    onSuccess: (_data, replyId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.replies.detail(replyId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.replies.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.upvotes.mine() });
    },
    onError: (error: ApiError) => {
      // Silently handle duplicate upvote errors (idempotency)
      if (error.status !== 400 && error.status !== 409) {
        toast.error(error.message || "Failed to upvote reply");
      }
    },
  });
};

export const useRemoveReplyUpvote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (replyId: number) => upvotesApi.removeReplyUpvote(replyId),
    onSuccess: (_data, replyId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.replies.detail(replyId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.replies.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.upvotes.mine() });
    },
    onError: (error: ApiError) => {
      // Silently handle if upvote doesn't exist
      if (error.status !== 404) {
        toast.error(error.message || "Failed to remove upvote");
      }
    },
  });
};

export const useMyUpvotes = () => {
  return useQuery({
    queryKey: queryKeys.upvotes.mine(),
    queryFn: async () => {
      try {
        return await upvotesApi.getMyUpvotes();
      } catch (error) {
        const apiError = error as ApiError;
        toast.error(apiError.message || "Failed to fetch upvotes");
        throw error;
      }
    },
  });
};
