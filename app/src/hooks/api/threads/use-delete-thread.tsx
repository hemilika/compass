import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/lib/httpClient";
import { threadsApi } from "@/services/api";
import { queryKeys } from "../query-keys";

export const useDeleteThread = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => threadsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.threads.lists() });
      toast.success("Thread deleted successfully");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to delete thread");
    },
  });
};

