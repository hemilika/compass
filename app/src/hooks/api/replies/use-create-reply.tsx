import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/lib/httpClient";
import { repliesApi, postsApi } from "@/services/api";
import type { CreateReplyRequest } from "@/types/api";
import { queryKeys } from "../query-keys";

export const useCreateReply = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateReplyRequest) => repliesApi.create(data),
    onSuccess: async (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.replies.list(data.post_id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.detail(data.post_id),
      });
      // Get post and thread context for toast message
      try {
        const post = await postsApi.getById(data.post_id);
        const threadName = post.thread?.name || "the hive";
        toast.success(`You replied to a post in ${threadName} hive`);
      } catch {
        toast.success("You created a reply");
      }
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "You couldn't create the reply");
    },
  });
};
