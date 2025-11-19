import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/lib/httpClient";
import { threadsApi } from "@/services/api";
import type { CreateThreadRequest } from "@/types/api";
import { queryKeys } from "../query-keys";

export const useCreateThread = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateThreadRequest) => threadsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.threads.lists() });
      toast.success("Thread created successfully");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to create thread");
    },
  });
};

