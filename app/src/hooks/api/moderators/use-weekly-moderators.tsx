import { useQuery, useMemo } from "@tanstack/react-query";
import { useThreads } from "../threads/use-threads";
import { queryKeys } from "../query-keys";
import type { WeeklyModerator } from "@/types/api";

export const useWeeklyModerators = () => {
  const { data: threads, isLoading } = useThreads();

  return useQuery<WeeklyModerator[]>({
    queryKey: queryKeys.moderators.weekly(),
    queryFn: async () => {
      if (!threads) return [];

      // Aggregate moderators from all threads
      const moderatorMap = new Map<number, WeeklyModerator>();

      threads.forEach((thread) => {
        const moderators = thread.threadUsers?.filter(
          (tu) => tu.role === "moderator" && tu.user
        ) || [];

        moderators.forEach((mod) => {
          if (!mod.user) return;

          const existing = moderatorMap.get(mod.user_id);
          if (existing) {
            existing.threadCount++;
            existing.threads.push({
              threadId: thread.id,
              threadName: thread.name,
            });
          } else {
            moderatorMap.set(mod.user_id, {
              userId: mod.user_id,
              firstname: mod.user.firstname || "",
              lastname: mod.user.lastname || "",
              email: mod.user.email,
              threadCount: 1,
              threads: [
                {
                  threadId: thread.id,
                  threadName: thread.name,
                },
              ],
            });
          }
        });
      });

      return Array.from(moderatorMap.values()).sort(
        (a, b) => b.threadCount - a.threadCount
      );
    },
    enabled: !!threads && !isLoading,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

