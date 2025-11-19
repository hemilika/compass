import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/lib/httpClient";
import { buApi } from "@/services/api";
import type { UpdateBuRequest } from "@/types/api";
import { queryKeys } from "../query-keys";

export const useUpdateBusinessUnit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateBuRequest }) =>
      buApi.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.bu.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.bu.lists() });
      toast.success("Business unit updated successfully");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to update business unit");
    },
  });
};

