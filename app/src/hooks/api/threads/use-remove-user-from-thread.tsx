import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/lib/httpClient";
import { threadsApi } from "@/services/api";
import { queryKeys } from "../query-keys";

export const useRemoveUserFromThread = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ threadId, userId }: { threadId: number; userId: number }) =>
      threadsApi.removeUser(threadId, userId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.threads.detail(variables.threadId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.threads.lists() });
      toast.success("User removed from thread successfully");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to remove user from thread");
    },
  });
};

