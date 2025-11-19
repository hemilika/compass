import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/lib/httpClient";
import { upvotesApi } from "@/services/api";
import { queryKeys } from "../query-keys";

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

