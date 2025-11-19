import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/lib/httpClient";
import { searchApi } from "@/services/api";
import type { AiSearchRequest } from "@/types/api";

export const useAiSearch = () => {
  return useMutation({
    mutationFn: (data: AiSearchRequest) => searchApi.aiSearch(data),
    onError: (error: ApiError) => {
      toast.error(error.message || "AI search failed");
    },
  });
};

