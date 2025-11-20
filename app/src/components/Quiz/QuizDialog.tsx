import { useState } from "react";
import { Trophy, Loader2 } from "lucide-react";
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
import { useActiveQuiz, useSubmitQuiz, useQuizLeaderboard } from "@/hooks/api";
import { cn } from "@/lib/utils";

interface QuizDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const QuizDialog = ({ open, onOpenChange }: QuizDialogProps) => {
  const { data: quiz, isLoading } = useActiveQuiz();
  const submitQuizMutation = useSubmitQuiz();
  const { data: leaderboard } = useQuizLeaderboard(quiz?.id || 0, 10);
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    totalQuestions: number;
    passed: boolean;
  } | null>(null);

  const handleAnswerChange = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (!quiz || answers.length !== quiz.questions.length) {
      return;
    }

    try {
      const result = await submitQuizMutation.mutateAsync({
        quizId: Number(quiz.id), // Ensure quizId is explicitly an integer
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

  if (isLoading) {
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

        {!submitted ? (
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
                disabled={!allAnswered || submitQuizMutation.isPending}
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
            <Card
              className={cn(
                "border-2",
                result?.passed
                  ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                  : "border-orange-500 bg-orange-50 dark:bg-orange-950/20"
              )}
            >
              <CardContent className="p-6 text-center">
                <Trophy
                  className={cn(
                    "mx-auto mb-4 h-12 w-12",
                    result?.passed ? "text-green-600" : "text-orange-600"
                  )}
                />
                <h3 className="mb-2 text-xl font-bold">
                  {result?.passed ? "Congratulations!" : "Keep Learning!"}
                </h3>
                <p className="mb-4 text-lg">
                  You scored {result?.score} out of {result?.totalQuestions}
                </p>
                {result?.passed ? (
                  <Badge className="bg-green-600">Passed</Badge>
                ) : (
                  <Badge variant="secondary">Not Passed</Badge>
                )}
              </CardContent>
            </Card>

            {leaderboard && leaderboard.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h4 className="mb-4 font-semibold">Leaderboard</h4>
                  <div className="space-y-2">
                    {leaderboard.slice(0, 5).map((entry, index) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between rounded-lg border p-2"
                      >
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">#{index + 1}</Badge>
                          <span className="text-sm font-medium">
                            {entry.user.firstname} {entry.user.lastname}
                          </span>
                        </div>
                        <Badge>
                          {entry.score}/{quiz.questions.length}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
