import { useParams, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Trophy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useActiveQuiz, useQuizLeaderboard } from "@/hooks/api";
import { QuizLeaderboard } from "@/components/Quiz/QuizLeaderboard";

const QuizLeaderboardPage = () => {
  const { quizId } = useParams({ strict: false });
  const navigate = useNavigate();
  const quizIdNumber = quizId ? Number(quizId) : null;
  const { data: quiz, isLoading: quizLoading } = useActiveQuiz(true);
  const { data: leaderboard, isLoading: leaderboardLoading } =
    useQuizLeaderboard(
      quizIdNumber || quiz?.id || 0,
      50 // Show more entries on the full page
    );

  const displayQuizId = quizIdNumber || quiz?.id;
  const isLoading = quizLoading || leaderboardLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!displayQuizId || !quiz) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-destructive">Quiz not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/" })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Quiz Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Trophy className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl">{quiz.title}</CardTitle>
              {quiz.description && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {quiz.description}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <QuizLeaderboard
            data={leaderboard && Array.isArray(leaderboard) ? leaderboard : []}
            totalQuestions={quiz.questions.length}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizLeaderboardPage;
