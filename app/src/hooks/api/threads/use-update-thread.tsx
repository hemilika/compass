import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/lib/httpClient";
import { threadsApi } from "@/services/api";
import type { UpdateThreadRequest } from "@/types/api";
import { queryKeys } from "../query-keys";

export const useUpdateThread = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateThreadRequest }) =>
      threadsApi.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.threads.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.threads.lists() });
      toast.success(`You updated ${variables.data.name || "the hive"}`);
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "You couldn't update the hive");
    },
  });
};

