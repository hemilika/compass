import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/lib/httpClient";
import { postsApi } from "@/services/api";
import { queryKeys } from "../query-keys";

export const useDeletePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      // Get post data before deleting for toast message
      const post = await postsApi.getById(id);
      await postsApi.delete(id);
      return post;
    },
    onSuccess: (post) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() });
      const threadName = post.thread?.name || "the hive";
      toast.success(`You deleted your post from ${threadName} hive`);
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "You couldn't delete the post");
    },
  });
};

