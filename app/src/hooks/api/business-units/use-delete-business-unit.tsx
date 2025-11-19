import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/lib/httpClient";
import { buApi } from "@/services/api";
import { queryKeys } from "../query-keys";

export const useDeleteBusinessUnit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => buApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bu.lists() });
      toast.success("Business unit deleted successfully");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to delete business unit");
    },
  });
};

