import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/lib/httpClient";
import { threadsApi } from "@/services/api";
import { queryKeys } from "../query-keys";

export const useThreads = (enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.threads.lists(),
    queryFn: async () => {
      try {
        return await threadsApi.getAll();
      } catch (error) {
        const apiError = error as ApiError;
        if (apiError.status !== 401) {
          toast.error(apiError.message || "Failed to fetch threads");
        }
        throw error;
      }
    },
    enabled,
  });
};
