import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Bu } from '../bu/bu.entity';
import { Thread } from '../threads/thread.entity';
import { User } from '../users/user.entity';
import { Reply } from '../replies/reply.entity';
import { Upvote } from '../upvotes/upvote.entity';

@Entity('posts')
@Index(['bu_id'])
@Index(['thread_id'])
@Index(['author_id'])
@Index(['created_at'])
export class Post {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'bigint', nullable: true })
  bu_id: number;

  @Column({ type: 'bigint' })
  thread_id: number;

  @Column({ type: 'bigint' })
  author_id: number;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'varchar', nullable: true })
  icon_url: string;

  @Column('varchar', { array: true, default: [] })
  image_urls: string[];

  @Column({ type: 'int', default: 0 })
  upvote_count: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updated_at: Date;

  @ManyToOne(() => Bu, (bu) => bu.posts, { nullable: true })
  @JoinColumn({ name: 'bu_id' })
  bu: Bu;

  @ManyToOne(() => Thread, (thread) => thread.posts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'thread_id' })
  thread: Thread;

  @ManyToOne(() => User, (user) => user.posts)
  @JoinColumn({ name: 'author_id' })
  author: User;

  @OneToMany(() => Reply, (reply) => reply.post)
  replies: Reply[];

  @OneToMany(() => Upvote, (upvote) => upvote.post)
  upvotes: Upvote[];
}
