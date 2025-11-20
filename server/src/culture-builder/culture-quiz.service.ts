import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CultureQuiz } from './entities/quiz.entity';
import { CultureQuizSubmission } from './entities/quiz-submission.entity';
import { CultureAiService } from './culture-ai.service';
import {
  Quiz,
  QuizSubmission,
  QuizResult,
} from './types/culture-builder.types';

@Injectable()
export class CultureQuizService {
  private readonly logger = new Logger(CultureQuizService.name);

  constructor(
    @InjectRepository(CultureQuiz)
    private readonly quizRepo: Repository<CultureQuiz>,
    @InjectRepository(CultureQuizSubmission)
    private readonly submissionRepo: Repository<CultureQuizSubmission>,
    private readonly aiService: CultureAiService,
  ) {}

  async generateQuiz(challengeType: string): Promise<Quiz> {
    this.logger.log(`Generating quiz for challenge type: ${challengeType}`);

    const quizData = await this.aiService.generateQuiz(challengeType);

    // Save quiz to database
    const quiz = this.quizRepo.create({
      title: quizData.title,
      description: quizData.description,
      questions: quizData.questions,
      is_active: true,
    });

    const savedQuiz = await this.quizRepo.save(quiz);

    // Return quiz without correct answers
    return {
      id: savedQuiz.id,
      title: savedQuiz.title,
      description: savedQuiz.description,
      questions: savedQuiz.questions.map((q) => ({
        question: q.question,
        alternatives: q.alternatives,
      })),
      createdAt: savedQuiz.created_at,
    };
  }

  async getActiveQuiz(): Promise<Quiz | null> {
    const quiz = await this.quizRepo.findOne({
      where: { is_active: true },
      order: { created_at: 'DESC' },
    });

    if (!quiz) {
      return null;
    }

    return {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      questions: quiz.questions.map((q) => ({
        question: q.question,
        alternatives: q.alternatives,
      })),
      createdAt: quiz.created_at,
    };
  }

  async submitQuiz(
    userId: number,
    submission: QuizSubmission,
  ): Promise<QuizResult> {
    const quiz = await this.quizRepo.findOne({
      where: { id: submission.quizId },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    if (submission.answers.length !== quiz.questions.length) {
      throw new BadRequestException('Invalid number of answers');
    }

    // Check if user already submitted
    const existingSubmission = await this.submissionRepo.findOne({
      where: {
        quiz_id: submission.quizId,
        user_id: userId,
      },
    });

    if (existingSubmission) {
      throw new BadRequestException('You have already submitted this quiz');
    }

    // Calculate score
    let score = 0;
    const correctAnswers: number[] = [];

    quiz.questions.forEach((question, index) => {
      correctAnswers.push(question.correctAnswer);
      if (submission.answers[index] === question.correctAnswer) {
        score++;
      }
    });

    const passed = score >= 3; // Pass if at least 3 out of 5 correct

    // Save submission
    const quizSubmission = this.submissionRepo.create({
      quiz_id: submission.quizId,
      user_id: userId,
      answers: submission.answers,
      score,
      passed,
    });

    await this.submissionRepo.save(quizSubmission);

    return {
      quizId: submission.quizId,
      score,
      totalQuestions: quiz.questions.length,
      passed,
      correctAnswers,
    };
  }

  async getUserSubmissions(userId: number): Promise<CultureQuizSubmission[]> {
    return this.submissionRepo.find({
      where: { user_id: userId },
      relations: ['quiz'],
      order: { created_at: 'DESC' },
    });
  }

  async getQuizLeaderboard(quizId: number, limit: number = 10) {
    return this.submissionRepo
      .createQueryBuilder('submission')
      .leftJoinAndSelect('submission.user', 'user')
      .where('submission.quiz_id = :quizId', { quizId })
      .orderBy('submission.score', 'DESC')
      .addOrderBy('submission.created_at', 'ASC')
      .limit(limit)
      .getMany();
  }
}
