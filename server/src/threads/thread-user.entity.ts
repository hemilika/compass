import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Thread } from './thread.entity';

@Entity('thread_users')
@Unique(['user_id', 'thread_id'])
@Index(['user_id', 'thread_id'])
export class ThreadUser {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'bigint' })
  user_id: number;

  @Column({ type: 'bigint' })
  thread_id: number;

  @Column({ type: 'varchar', nullable: true })
  role: string;

  @ManyToOne(() => User, (user) => user.threadUsers)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Thread, (thread) => thread.threadUsers)
  @JoinColumn({ name: 'thread_id' })
  thread: Thread;
}
