import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/lib/httpClient";
import { cultureBuilderApi } from "@/services/api";
import type { QuizSubmission, QuizResult } from "@/types/api";
import { queryKeys } from "../query-keys";

export const useSubmitQuiz = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: QuizSubmission) => cultureBuilderApi.submitQuiz(data),
    onSuccess: (result: QuizResult) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.quiz.submissions(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.quiz.leaderboard(result.quizId),
      });
      if (result.passed) {
        toast.success(
          `You passed the quiz! Score: ${result.score}/${result.totalQuestions}`
        );
      } else {
        toast.info(
          `You scored ${result.score}/${result.totalQuestions}. Keep learning!`
        );
      }
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "You couldn't submit the quiz");
    },
  });
};

