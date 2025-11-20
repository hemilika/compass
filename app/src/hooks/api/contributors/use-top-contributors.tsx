import { useQuery } from "@tanstack/react-query";
import { cultureBuilderApi } from "@/services/api";
import { queryKeys } from "../query-keys";
import type { WeeklyContributor } from "@/types/api";

export const useTopContributors = () => {
  return useQuery<WeeklyContributor[]>({
    queryKey: queryKeys.contributors.weekly(),
    queryFn: () => cultureBuilderApi.getTopContributors(),
    staleTime: 1000 * 60 * 60, // 1 hour - weekly data doesn't change often
  });
};

