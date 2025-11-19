import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/lib/httpClient";
import { postsApi } from "@/services/api";
import { queryKeys } from "../query-keys";

export const usePost = (id: number) => {
  return useQuery({
    queryKey: queryKeys.posts.detail(id),
    queryFn: async () => {
      try {
        return await postsApi.getById(id);
      } catch (error) {
        const apiError = error as ApiError;
        toast.error(apiError.message || "Failed to fetch post");
        throw error;
      }
    },
    enabled: !!id,
  });
};

