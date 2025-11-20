import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/lib/httpClient";
import type { Thread } from "@/types/api";
import { threadsApi } from "@/services/api";
import { queryKeys } from "../query-keys";
import { useAuth } from "@/hooks/use-auth";

export const useLeaveThread = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: (threadId: number) => threadsApi.leave(threadId),
    onMutate: async (threadId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.threads.detail(threadId),
      });
      await queryClient.cancelQueries({ queryKey: queryKeys.threads.lists() });

      // Snapshot previous values
      const previousThread = queryClient.getQueryData<Thread>(
        queryKeys.threads.detail(threadId)
      );

      // Optimistically update thread to remove user from threadUsers
      if (previousThread && user) {
        const updatedThread: Thread = {
          ...previousThread,
          threadUsers: (previousThread.threadUsers || []).filter(
            (tu) => tu.user_id !== user.id
          ),
        };

        queryClient.setQueryData<Thread>(
          queryKeys.threads.detail(threadId),
          updatedThread
        );
      }

      return { previousThread };
    },
    onSuccess: async (_data, threadId) => {
      // Get the thread name for the toast message
      const thread = await threadsApi.getById(threadId);
      // Invalidate queries - this will trigger automatic refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.threads.detail(threadId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.threads.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.threads.recommended() });
      toast.success(`You have successfully left ${thread.name} Hive`);
    },
    onError: (error: ApiError, threadId, context) => {
      // Rollback on error
      if (context?.previousThread) {
        queryClient.setQueryData<Thread>(
          queryKeys.threads.detail(threadId),
          context.previousThread
        );
      }
      toast.error(error.message || "Failed to leave hive");
    },
  });
};

