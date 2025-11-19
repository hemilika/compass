import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/lib/httpClient";
import { usersApi } from "@/services/api";
import { queryKeys } from "../query-keys";

export const useUser = (id: number) => {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: async () => {
      try {
        return await usersApi.getById(id);
      } catch (error) {
        const apiError = error as ApiError;
        toast.error(apiError.message || "Failed to fetch user");
        throw error;
      }
    },
    enabled: !!id,
  });
};

