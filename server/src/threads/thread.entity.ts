import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
    Index,
} from 'typeorm';
import { Bu } from '../bu/bu.entity';
import { Post } from '../posts/post.entity';
import { ThreadUser } from './thread-user.entity';

@Entity('threads')
@Index(['bu_id'])
@Index(['created_at'])
export class Thread {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    id: number;

    @Column({ type: 'varchar' })
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'bigint', nullable: true })
    bu_id: number;

    @Column({ type: 'bigint' })
    creator_id: number;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @ManyToOne(() => Bu, (bu) => bu.threads, { nullable: true })
    @JoinColumn({ name: 'bu_id' })
    bu: Bu;

    @OneToMany(() => Post, (post) => post.thread)
    posts: Post[];

    @OneToMany(() => ThreadUser, (threadUser) => threadUser.thread)
    threadUsers: ThreadUser[];
}
