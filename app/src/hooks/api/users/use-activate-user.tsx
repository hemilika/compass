import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/lib/httpClient";
import { usersApi } from "@/services/api";
import { queryKeys } from "../query-keys";

export const useActivateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => usersApi.activate(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
      toast.success("User activated successfully");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to activate user");
    },
  });
};

