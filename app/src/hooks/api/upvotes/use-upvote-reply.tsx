import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/lib/httpClient";
import { upvotesApi } from "@/services/api";
import { queryKeys } from "../query-keys";

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

