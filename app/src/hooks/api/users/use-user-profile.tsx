import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/lib/httpClient";
import { usersApi } from "@/services/api";
import { queryKeys } from "../query-keys";

export const useUserProfile = () => {
  return useQuery({
    queryKey: queryKeys.users.profile(),
    queryFn: async () => {
      try {
        return await usersApi.getProfile();
      } catch (error) {
        const apiError = error as ApiError;
        toast.error(apiError.message || "Failed to fetch profile");
        throw error;
      }
    },
  });
};

