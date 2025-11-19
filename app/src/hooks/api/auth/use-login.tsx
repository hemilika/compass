import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/lib/httpClient";
import { authApi } from "@/services/api";
import type { LoginRequest } from "@/types/api";

export const useLogin = () => {
  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onError: (error: ApiError) => {
      toast.error(error.message || "Login failed");
    },
  });
};

