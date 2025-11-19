import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/lib/httpClient";
import { authApi } from "@/services/api";
import type { SignupRequest } from "@/types/api";

export const useSignup = () => {
  return useMutation({
    mutationFn: (data: SignupRequest) => authApi.signup(data),
    onError: (error: ApiError) => {
      toast.error(error.message || "Signup failed");
    },
  });
};

