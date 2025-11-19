import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/lib/httpClient";
import { repliesApi } from "@/services/api";
import { queryKeys } from "../query-keys";

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

