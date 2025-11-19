import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/lib/httpClient";
import { threadsApi } from "@/services/api";
import { queryKeys } from "../query-keys";

export const useAddUserToThread = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      threadId,
      userId,
      role,
    }: {
      threadId: number;
      userId: number;
      role: "member" | "moderator";
    }) => threadsApi.addUser(threadId, userId, { role }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.threads.detail(variables.threadId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.threads.lists() });
      toast.success("User added to thread successfully");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to add user to thread");
    },
  });
};

