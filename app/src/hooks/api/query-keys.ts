import type { SearchQueryParams } from "@/types/api";

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
  search: {
    all: ["search"] as const,
    query: (params: SearchQueryParams) =>
      [...queryKeys.search.all, "query", params] as const,
    ai: () => [...queryKeys.search.all, "ai"] as const,
  },
};

