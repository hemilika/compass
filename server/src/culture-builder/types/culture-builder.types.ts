export interface WeeklyContributor {
  userId: number;
  firstname: string;
  lastname: string;
  postCount: number;
  replyCount: number;
  totalUpvotes: number;
}

export interface TopPost {
  id: number;
  title: string;
  upvotes: number;
  replies: number;
}

export interface ChallengeData {
  type: 'engagement' | 'cross-bu' | 'mentorship' | 'knowledge-share';
  title: string;
  description: string;
  targetMetric?: string;
  currentValue?: number;
  targetValue?: number;
}

export interface WeeklyAnalytics {
  topPosts: TopPost[];
  totalUpvotes: number;
}

export interface QuizQuestion {
  question: string;
  alternatives: string[];
  correctAnswer: number; // index of correct answer (0-3)
}

export interface Quiz {
  id: number;
  title: string;
  description: string;
  questions: Omit<QuizQuestion, 'correctAnswer'>[]; // Don't send correct answers to frontend
  createdAt: Date;
}

export interface QuizSubmission {
  quizId: number;
  answers: number[]; // array of selected answer indices
}

export interface QuizResult {
  quizId: number;
  score: number;
  totalQuestions: number;
  passed: boolean;
  correctAnswers: number[];
}
