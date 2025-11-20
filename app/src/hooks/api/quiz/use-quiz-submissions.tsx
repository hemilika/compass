import { useQuery } from "@tanstack/react-query";
import { cultureBuilderApi } from "@/services/api";
import { queryKeys } from "../query-keys";
import type { QuizSubmissionHistory } from "@/types/api";

export const useQuizSubmissions = (enabled: boolean = true) => {
  return useQuery<QuizSubmissionHistory[]>({
    queryKey: queryKeys.quiz.submissions(),
    queryFn: () => cultureBuilderApi.getMySubmissions(),
    enabled,
  });
};
