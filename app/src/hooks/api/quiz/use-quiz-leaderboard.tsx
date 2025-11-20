import { useQuery } from "@tanstack/react-query";
import { cultureBuilderApi } from "@/services/api";
import { queryKeys } from "../query-keys";
import type { QuizLeaderboardEntry } from "@/types/api";

export const useQuizLeaderboard = (quizId: number, limit: number = 10) => {
  return useQuery<QuizLeaderboardEntry[]>({
    queryKey: queryKeys.quiz.leaderboard(quizId),
    queryFn: () => cultureBuilderApi.getQuizLeaderboard(quizId, limit),
    enabled: !!quizId,
  });
};

