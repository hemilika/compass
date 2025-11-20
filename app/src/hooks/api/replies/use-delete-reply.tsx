import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/lib/httpClient";
import { repliesApi } from "@/services/api";
import { queryKeys } from "../query-keys";

export const useDeleteReply = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => repliesApi.delete(id),
    onSuccess: (_data, id) => {
      // Invalidate all reply queries
      queryClient.invalidateQueries({ queryKey: queryKeys.replies.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.replies.detail(id) });
      // Also invalidate posts to refresh reply counts
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.details() });
      toast.success("You deleted your reply");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "You couldn't delete the reply");
    },
  });
};

