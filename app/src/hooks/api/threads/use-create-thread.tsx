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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.threads.lists() });
      toast.success(`You created ${data.name} hive`);
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "You couldn't create the hive");
    },
  });
};

