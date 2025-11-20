import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/lib/httpClient";
import { threadsApi } from "@/services/api";
import { queryKeys } from "../query-keys";

export const useDeleteThread = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      // Get thread data before deleting for toast message
      const thread = await threadsApi.getById(id);
      await threadsApi.delete(id);
      return thread;
    },
    onSuccess: (thread) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.threads.lists() });
      toast.success(`You deleted ${thread.name} hive`);
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "You couldn't delete the hive");
    },
  });
};

