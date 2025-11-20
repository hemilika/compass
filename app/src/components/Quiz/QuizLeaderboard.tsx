import { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { QuizLeaderboardEntry } from "@/types/api";

interface QuizLeaderboardProps {
  data: QuizLeaderboardEntry[];
  totalQuestions: number;
}

export const QuizLeaderboard = ({
  data,
  totalQuestions,
}: QuizLeaderboardProps) => {
  // Ensure data is always an array (idempotent)
  const safeData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data;
  }, [data]);

  // Ensure totalQuestions is a valid number (idempotent)
  const safeTotalQuestions = useMemo(() => {
    const num = Number(totalQuestions);
    return Number.isInteger(num) && num > 0 ? num : 0;
  }, [totalQuestions]);

  if (safeData.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        No leaderboard entries yet.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Rank</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {safeData.map((entry, index) => {
            const rank = index + 1;
            const user = entry.user;
            const userName =
              user?.firstname && user?.lastname
                ? `${user.firstname} ${user.lastname}`
                : user?.email?.split("@")[0] || "Unknown";
            const score = Number(entry.score) || 0;
            const passed = Boolean(entry.passed);

            return (
              <TableRow key={entry.user?.id || index}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="w-10 justify-center">
                      #{rank}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{userName}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {score}/{safeTotalQuestions}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={passed ? "bg-green-600" : "bg-orange-500"}>
                    {passed ? "Passed" : "Not Passed"}
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
