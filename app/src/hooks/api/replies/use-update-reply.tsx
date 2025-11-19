import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/lib/httpClient";
import { repliesApi } from "@/services/api";
import type { UpdateReplyRequest } from "@/types/api";
import { queryKeys } from "../query-keys";

export const useUpdateReply = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateReplyRequest }) =>
      repliesApi.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.replies.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.replies.lists() });
      // Invalidate post detail to refresh reply counts
      if (data.post_id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.posts.detail(data.post_id),
        });
      }
      toast.success("Reply updated successfully");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to update reply");
    },
  });
};

