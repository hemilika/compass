import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/lib/httpClient";
import { searchApi } from "@/services/api";
import type { SearchQueryParams } from "@/types/api";
import { queryKeys } from "../query-keys";

export const useSearch = (params: SearchQueryParams, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.search.query(params),
    queryFn: async () => {
      try {
        return await searchApi.search(params);
      } catch (error) {
        const apiError = error as ApiError;
        toast.error(apiError.message || "Search failed");
        throw error;
      }
    },
    enabled: enabled && !!params.query.trim(),
    staleTime: 30000, // Cache for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });
};

