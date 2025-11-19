import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/lib/httpClient";
import { buApi } from "@/services/api";
import type { CreateBuRequest } from "@/types/api";
import { queryKeys } from "../query-keys";

export const useCreateBusinessUnit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBuRequest) => buApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bu.lists() });
      toast.success("Business unit created successfully");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to create business unit");
    },
  });
};

