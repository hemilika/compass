import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/lib/httpClient";
import { postsApi } from "@/services/api";
import type { CreatePostRequest } from "@/types/api";
import { queryKeys } from "../query-keys";

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePostRequest) => postsApi.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.list(data.thread_id),
      });
      toast.success("Post created successfully");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to create post");
    },
  });
};

