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
import { Post } from '../posts/post.entity';
import { User } from '../users/user.entity';
import { Upvote } from '../upvotes/upvote.entity';

@Entity('replies')
@Index(['post_id'])
@Index(['author_id'])
@Index(['parent_reply_id'])
@Index(['created_at'])
export class Reply {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'bigint' })
  post_id: number;

  @Column({ type: 'bigint' })
  author_id: number;

  @Column({ type: 'bigint', nullable: true })
  parent_reply_id: number;

  @Column({ type: 'text' })
  content: string;

  @Column('varchar', { array: true, default: [] })
  image_urls: string[];

  @Column({ type: 'int', default: 0 })
  upvote_count: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updated_at: Date;

  @ManyToOne(() => Post, (post) => post.replies, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @ManyToOne(() => User, (user) => user.replies)
  @JoinColumn({ name: 'author_id' })
  author: User;

  @ManyToOne(() => Reply, (reply) => reply.childReplies, { nullable: true })
  @JoinColumn({ name: 'parent_reply_id' })
  parentReply: Reply;

  @OneToMany(() => Reply, (reply) => reply.parentReply, { onDelete: 'CASCADE' })
  childReplies: Reply[];

  @OneToMany(() => Upvote, (upvote) => upvote.reply, { onDelete: 'CASCADE' })
  upvotes: Upvote[];
}
