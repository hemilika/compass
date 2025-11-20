import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/lib/httpClient";
import type { Thread, ThreadUser } from "@/types/api";
import { threadsApi } from "@/services/api";
import { queryKeys } from "../query-keys";
import { useAuth } from "@/hooks/use-auth";

export const useJoinThread = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (threadId: number) => threadsApi.join(threadId),
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

      // Optimistically update thread to add user to threadUsers
      if (previousThread && user) {
        // Check if user is already in threadUsers to avoid duplicates
        const isAlreadyMember = previousThread.threadUsers?.some(
          (tu) => tu.user_id === user.id
        );

        if (!isAlreadyMember) {
          const newThreadUser: ThreadUser = {
            id: -Date.now(), // Temporary ID
            user_id: user.id,
            thread_id: threadId,
            role: "member",
            user: user,
          };

          const updatedThread: Thread = {
            ...previousThread,
            threadUsers: [...(previousThread.threadUsers || []), newThreadUser],
          };

          queryClient.setQueryData<Thread>(
            queryKeys.threads.detail(threadId),
            updatedThread
          );
        }
      }

      return { previousThread };
    },
    onSuccess: async (_data, threadId) => {
      // Get the thread name for the toast message
      const thread = await threadsApi.getById(threadId);
      // Invalidate queries - this will trigger automatic refetch when component re-renders
      queryClient.invalidateQueries({
        queryKey: queryKeys.threads.detail(threadId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.threads.lists() });
      toast.success(`You have successfully joined ${thread.name} Hive`);
    },
    onError: (error: ApiError, threadId, context) => {
      // Rollback on error
      if (context?.previousThread) {
        queryClient.setQueryData<Thread>(
          queryKeys.threads.detail(threadId),
          context.previousThread
        );
      }
      toast.error(error.message || "Failed to join hive");
    },
  });
};
