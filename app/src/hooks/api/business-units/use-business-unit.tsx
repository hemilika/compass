import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/lib/httpClient";
import { buApi } from "@/services/api";
import { queryKeys } from "../query-keys";

export const useBusinessUnit = (id: number) => {
  return useQuery({
    queryKey: queryKeys.bu.detail(id),
    queryFn: async () => {
      try {
        return await buApi.getById(id);
      } catch (error) {
        const apiError = error as ApiError;
        toast.error(apiError.message || "Failed to fetch business unit");
        throw error;
      }
    },
    enabled: !!id,
  });
};

