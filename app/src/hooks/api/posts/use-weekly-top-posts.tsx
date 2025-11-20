import { useQuery } from "@tanstack/react-query";
import { cultureBuilderApi } from "@/services/api";
import { queryKeys } from "../query-keys";
import type { WeeklyAnalytics } from "@/types/api";

export const useWeeklyTopPosts = () => {
  return useQuery<WeeklyAnalytics>({
    queryKey: queryKeys.posts.weeklyTop(),
    queryFn: async () => {
      const data = await cultureBuilderApi.getWeeklyAnalytics();
      return data as WeeklyAnalytics;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

