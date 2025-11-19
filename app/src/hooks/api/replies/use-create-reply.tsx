import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/lib/httpClient";
import { repliesApi } from "@/services/api";
import type { CreateReplyRequest } from "@/types/api";
import { queryKeys } from "../query-keys";

export const useCreateReply = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateReplyRequest) => repliesApi.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.replies.list(data.post_id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.detail(data.post_id),
      });
      toast.success("Reply created successfully");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to create reply");
    },
  });
};

