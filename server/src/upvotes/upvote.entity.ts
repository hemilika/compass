import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
    Unique,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Post } from '../posts/post.entity';
import { Reply } from '../replies/reply.entity';

@Entity('upvotes')
@Unique(['user_id', 'post_id'])
@Unique(['user_id', 'reply_id'])
export class Upvote {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    id: number;

    @Column({ type: 'bigint' })
    user_id: number;

    @Column({ type: 'varchar' })
    type: string;

    @Column({ type: 'bigint', nullable: true })
    post_id: number;

    @Column({ type: 'bigint', nullable: true })
    reply_id: number;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @ManyToOne(() => User, (user) => user.upvotes)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Post, (post) => post.upvotes, { nullable: true })
    @JoinColumn({ name: 'post_id' })
    post: Post;

    @ManyToOne(() => Reply, (reply) => reply.upvotes, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'reply_id' })
    reply: Reply;
}
