import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Post } from '../../posts/post.entity';

@Entity('appreciation_threads')
export class AppreciationThread {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'bigint' })
  generated_post_id: number;

  @Column({ type: 'date' })
  week_start_date: string;

  @Column({ type: 'jsonb' })
  contributors_data: any;

  @Column({ type: 'varchar', default: 'generated' })
  generation_status: string;

  @Column({ type: 'boolean', default: true })
  is_ai_generated: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @ManyToOne(() => Post, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'generated_post_id' })
  post: Post;
}
