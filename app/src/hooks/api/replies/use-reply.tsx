import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/lib/httpClient";
import { repliesApi } from "@/services/api";
import { queryKeys } from "../query-keys";

export const useReply = (id: number) => {
  return useQuery({
    queryKey: queryKeys.replies.detail(id),
    queryFn: async () => {
      try {
        return await repliesApi.getById(id);
      } catch (error) {
        const apiError = error as ApiError;
        toast.error(apiError.message || "Failed to fetch reply");
        throw error;
      }
    },
    enabled: !!id,
  });
};

