import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/lib/httpClient";
import { upvotesApi } from "@/services/api";
import { queryKeys } from "../query-keys";

export const useMyUpvotes = () => {
  return useQuery({
    queryKey: queryKeys.upvotes.mine(),
    queryFn: async () => {
      try {
        return await upvotesApi.getMyUpvotes();
      } catch (error) {
        const apiError = error as ApiError;
        toast.error(apiError.message || "Failed to fetch upvotes");
        throw error;
      }
    },
  });
};

