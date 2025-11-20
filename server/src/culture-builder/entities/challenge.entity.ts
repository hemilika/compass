import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Thread } from '../../threads/thread.entity';
import { Post } from '../../posts/post.entity';

@Entity('challenges')
export class Challenge {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    id: number;

    @Column({ type: 'varchar' })
    title: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'varchar' })
    challenge_type: string;

    @Column({ type: 'bigint', nullable: true })
    thread_id: number;

    @Column({ type: 'bigint', nullable: true })
    post_id: number;

    @Column({ type: 'timestamp' })
    start_date: Date;

    @Column({ type: 'timestamp' })
    end_date: Date;

    @Column({ type: 'varchar', default: 'active' })
    status: string;

    @Column({ type: 'jsonb', nullable: true })
    participation_metrics: any;

    @Column({ type: 'boolean', default: true })
    is_ai_generated: boolean;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @ManyToOne(() => Thread, { nullable: true })
    @JoinColumn({ name: 'thread_id' })
    thread: Thread;

    @ManyToOne(() => Post, { nullable: true })
    @JoinColumn({ name: 'post_id' })
    post: Post;
}
