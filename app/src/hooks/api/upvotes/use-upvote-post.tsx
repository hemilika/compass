import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/lib/httpClient";
import { upvotesApi } from "@/services/api";
import { queryKeys } from "../query-keys";

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

