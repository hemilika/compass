import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/lib/httpClient";
import { upvotesApi } from "@/services/api";
import { queryKeys } from "../query-keys";
import type { Reply } from "@/types/api";

export const useUpvoteReply = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (replyId: number) => upvotesApi.upvoteReply(replyId),
    onMutate: async (replyId) => {
      // Cancel outgoing refetches
      const allReplyQueries = queryClient.getQueriesData<Reply[]>({
        queryKey: queryKeys.replies.lists(),
      });

      await Promise.all(
        allReplyQueries.map(([queryKey]) =>
          queryClient.cancelQueries({ queryKey })
        )
      );

      // Snapshot previous values
      const previousReplies = allReplyQueries.map(([queryKey, replies]) => [
        queryKey,
        replies,
      ]) as Array<[unknown, Reply[] | undefined]>;

      // Optimistically update reply lists
      previousReplies.forEach(([queryKey, replies]) => {
        if (replies) {
          queryClient.setQueryData<Reply[]>(
            queryKey,
            replies.map((r) =>
              r.id === replyId ? { ...r, upvote_count: r.upvote_count + 1 } : r
            )
          );
        }
      });

      return { previousReplies };
    },
    onSuccess: (_data, replyId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.replies.detail(replyId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.replies.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.upvotes.mine() });
    },
    onError: (error: ApiError, replyId, context) => {
      // Rollback on error
      if (context?.previousReplies) {
        context.previousReplies.forEach(([queryKey, replies]) => {
          if (replies) {
            queryClient.setQueryData<Reply[]>(queryKey, replies);
          }
        });
      }
      // Silently handle duplicate upvote errors (idempotency)
      if (error.status !== 400 && error.status !== 409) {
        toast.error(error.message || "Failed to upvote reply");
      }
    },
  });
};
