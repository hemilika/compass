import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/lib/httpClient";
import { postsApi } from "@/services/api";
import type { UpdatePostRequest } from "@/types/api";
import { queryKeys } from "../query-keys";

export const useUpdatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePostRequest }) =>
      postsApi.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() });
      toast.success("Post updated successfully");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to update post");
    },
  });
};
