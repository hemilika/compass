import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/lib/httpClient";
import { postsApi } from "@/services/api";
import { queryKeys } from "../query-keys";

export const useDeletePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => postsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() });
      toast.success("Post deleted successfully");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to delete post");
    },
  });
};

