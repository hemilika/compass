import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/lib/httpClient";
import { upvotesApi } from "@/services/api";
import { queryKeys } from "../query-keys";

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

