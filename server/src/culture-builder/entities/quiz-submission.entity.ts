import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    Index,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from '../../users/user.entity';
import { CultureQuiz } from './quiz.entity';

@Entity('culture_quiz_submissions')
@Index(['user_id'])
@Index(['quiz_id'])
@Index(['created_at'])
export class CultureQuizSubmission {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    id: number;

    @Column({ type: 'bigint' })
    quiz_id: number;

    @Column({ type: 'bigint' })
    user_id: number;

    @Column('int', { array: true })
    answers: number[];

    @Column({ type: 'int' })
    score: number;

    @Column({ type: 'boolean' })
    passed: boolean;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @ManyToOne(() => CultureQuiz)
    @JoinColumn({ name: 'quiz_id' })
    quiz: CultureQuiz;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;
}
