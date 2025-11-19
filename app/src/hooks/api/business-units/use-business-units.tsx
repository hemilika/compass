import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/lib/httpClient";
import { buApi } from "@/services/api";
import { queryKeys } from "../query-keys";

export const useBusinessUnits = () => {
  return useQuery({
    queryKey: queryKeys.bu.lists(),
    queryFn: async () => {
      try {
        return await buApi.getAll();
      } catch (error) {
        const apiError = error as ApiError;
        toast.error(apiError.message || "Failed to fetch business units");
        throw error;
      }
    },
  });
};

