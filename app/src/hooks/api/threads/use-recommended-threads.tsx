import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/lib/httpClient";
import { threadsApi } from "@/services/api";
import { queryKeys } from "../query-keys";
import { useAuth } from "@/hooks/use-auth";

export const useRecommendedThreads = (enabled: boolean = true) => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.threads.recommended(),
    queryFn: async () => {
      try {
        return await threadsApi.getRecommended();
      } catch (error) {
        const apiError = error as ApiError;
        if (apiError.status !== 401) {
          toast.error(apiError.message || "Failed to fetch recommended hives");
        }
        throw error;
      }
    },
    enabled: isAuthenticated && enabled, // Only fetch if user is authenticated
  });
};
