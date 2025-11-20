import { useQuery } from "@tanstack/react-query";
import { cultureBuilderApi } from "@/services/api";
import { queryKeys } from "../query-keys";
import type { Quiz } from "@/types/api";

export const useActiveQuiz = () => {
  return useQuery<Quiz | null>({
    queryKey: queryKeys.quiz.active(),
    queryFn: async () => {
      const result = await cultureBuilderApi.getActiveQuiz();
      // Check if it's the message response (no active quiz)
      if ("message" in result) {
        return null;
      }
      return result as Quiz;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

