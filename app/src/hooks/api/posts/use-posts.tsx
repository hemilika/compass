import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/lib/httpClient";
import { postsApi } from "@/services/api";
import { queryKeys } from "../query-keys";

export const usePosts = (threadId?: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.posts.list(threadId),
    queryFn: async () => {
      try {
        return await postsApi.getAll(threadId);
      } catch (error) {
        const apiError = error as ApiError;
        if (apiError.status !== 401) {
          toast.error(apiError.message || "Failed to fetch posts");
        }
        throw error;
      }
    },
    enabled,
  });
};
