import { useState, useMemo } from "react";
import { Trophy, Loader2 } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  useActiveQuiz,
  useSubmitQuiz,
  useQuizLeaderboard,
  useQuizSubmissions,
} from "@/hooks/api";
import { useAuth } from "@/hooks/use-auth";
import { QuizLeaderboard } from "./QuizLeaderboard";
import { cn } from "@/lib/utils";

interface QuizDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const QuizDialog = ({ open, onOpenChange }: QuizDialogProps) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { data: quiz, isLoading } = useActiveQuiz(isAuthenticated && open);
  const { data: submissions, isLoading: submissionsLoading } =
    useQuizSubmissions(isAuthenticated && open);
  const submitQuizMutation = useSubmitQuiz();
  const { data: leaderboard } = useQuizLeaderboard(quiz?.id || 0, 10);
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    totalQuestions: number;
    passed: boolean;
  } | null>(null);

  // Check if user has already submitted this quiz (idempotent check)
  const existingSubmission = useMemo(() => {
    if (!quiz || !submissions || !user) return null;
    const quizId = Number(quiz.id);
    const userId = Number(user.id);
    // Ensure both IDs are valid integers
    if (!Number.isInteger(quizId) || !Number.isInteger(userId)) {
      return null;
    }
    return submissions.find((sub) => {
      const subQuizId = Number(sub.quiz_id);
      const subUserId = Number(sub.user_id);
      return (
        Number.isInteger(subQuizId) &&
        Number.isInteger(subUserId) &&
        subQuizId === quizId &&
        subUserId === userId
      );
    });
  }, [quiz, submissions, user]);

  const hasExistingSubmission = !!existingSubmission;

  const handleAnswerChange = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (!quiz || answers.length !== quiz.questions.length) {
      return;
    }

    // Prevent duplicate submissions (idempotency check)
    if (hasExistingSubmission) {
      return;
    }

    try {
      const quizId = Number(quiz.id);
      // Ensure quizId is a valid integer (idempotent conversion)
      if (!Number.isInteger(quizId) || isNaN(quizId) || quizId <= 0) {
        throw new Error("Invalid quiz ID");
      }

      const result = await submitQuizMutation.mutateAsync({
        quizId,
        answers,
      });
      setResult({
        score: result.score,
        totalQuestions: result.totalQuestions,
        passed: result.passed,
      });
      setSubmitted(true);
    } catch {
      // Error handled by mutation
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state when closing
    setTimeout(() => {
      setAnswers([]);
      setSubmitted(false);
      setResult(null);
    }, 300);
  };

  if (isLoading || submissionsLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!quiz) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>No Active Quiz</DialogTitle>
          </DialogHeader>
          <div className="py-8 text-center text-muted-foreground">
            <p>There is no active quiz available at the moment.</p>
            <p className="mt-2 text-sm">Check back later for new quizzes!</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // If user has already submitted, show results immediately
  const shouldShowResults = submitted || hasExistingSubmission;
  const displayResult: {
    score: number;
    totalQuestions: number;
    passed: boolean;
  } | null =
    result ||
    (existingSubmission
      ? {
          score: existingSubmission.score,
          totalQuestions: quiz.questions.length,
          passed: existingSubmission.passed,
        }
      : null);

  const allAnswered = answers.length === quiz.questions.length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            {quiz.title}
          </DialogTitle>
        </DialogHeader>

        {!shouldShowResults ? (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">{quiz.description}</p>

            <div className="space-y-6">
              {quiz.questions.map((question, questionIndex) => (
                <Card key={questionIndex}>
                  <CardContent className="p-4">
                    <div className="mb-4 flex items-center gap-2">
                      <Badge variant="secondary">
                        Question {questionIndex + 1}
                      </Badge>
                      {answers[questionIndex] !== undefined && (
                        <Badge variant="outline" className="text-xs">
                          Answered
                        </Badge>
                      )}
                    </div>
                    <h3 className="mb-4 font-semibold">{question.question}</h3>
                    <RadioGroup
                      value={
                        answers[questionIndex] !== undefined
                          ? answers[questionIndex].toString()
                          : undefined
                      }
                      onValueChange={(value) =>
                        handleAnswerChange(questionIndex, parseInt(value))
                      }
                    >
                      {question?.alternatives?.map((alternative, altIndex) => (
                        <div
                          key={altIndex}
                          className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-accent transition-colors"
                        >
                          <RadioGroupItem
                            value={altIndex.toString()}
                            id={`q${questionIndex}-a${altIndex}`}
                          />
                          <Label
                            htmlFor={`q${questionIndex}-a${altIndex}`}
                            className="flex-1 cursor-pointer"
                          >
                            {alternative}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={
                  !allAnswered ||
                  submitQuizMutation.isPending ||
                  hasExistingSubmission
                }
              >
                {submitQuizMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Quiz"
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {hasExistingSubmission && (
              <p className="text-sm text-muted-foreground text-center">
                You have already completed this quiz. Here are your results:
              </p>
            )}
            <Card
              className={cn(
                "border-2",
                displayResult?.passed
                  ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                  : "border-orange-500 bg-orange-50 dark:bg-orange-950/20"
              )}
            >
              <CardContent className="p-6 text-center">
                <Trophy
                  className={cn(
                    "mx-auto mb-4 h-12 w-12",
                    displayResult?.passed ? "text-green-600" : "text-orange-600"
                  )}
                />
                <h3 className="mb-2 text-xl font-bold">
                  {displayResult?.passed
                    ? "Congratulations!"
                    : "Keep Learning!"}
                </h3>
                <p className="mb-4 text-lg">
                  You scored {displayResult?.score} out of{" "}
                  {displayResult?.totalQuestions}
                </p>
                {displayResult?.passed ? (
                  <Badge className="bg-green-600">Passed</Badge>
                ) : (
                  <Badge variant="secondary">Not Passed</Badge>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="font-semibold">Leaderboard</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleClose();
                      navigate({ to: `/quiz/${quiz.id}/leaderboard` });
                    }}
                  >
                    View Full Leaderboard
                  </Button>
                </div>
                <QuizLeaderboard
                  data={
                    leaderboard && Array.isArray(leaderboard)
                      ? leaderboard.slice(0, 10)
                      : []
                  }
                  totalQuestions={quiz.questions.length}
                />
              </CardContent>
            </Card>

            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
