import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/lib/httpClient";
import { usersApi } from "@/services/api";
import { queryKeys } from "../query-keys";

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => usersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
      toast.success("User deleted successfully");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to delete user");
    },
  });
};

