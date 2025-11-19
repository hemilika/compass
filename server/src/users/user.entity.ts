import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
} from 'typeorm';
import { Bu } from '../bu/bu.entity';
import { Post } from '../posts/post.entity';
import { Reply } from '../replies/reply.entity';
import { Upvote } from '../upvotes/upvote.entity';
import { ThreadUser } from 'src/threads/thread-user.entity';


@Entity('users')
export class User {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    id: number;

    @Column({ type: 'bigint', nullable: true })
    tenant_id: number;

    @Column({ type: 'varchar', unique: true })
    email: string;

    @Column({ type: 'varchar', nullable: true })
    firstname: string;

    @Column({ type: 'varchar', nullable: true })
    lastname: string;

    @Column({ type: 'varchar', select: false })
    password: string;

    @Column('varchar', { array: true, default: ['user'] })
    roles: string[];

    @Column('varchar', { array: true, default: [] })
    techstack: string[];

    @Column('varchar', { array: true, default: [] })
    user_roles: string[];

    @Column('varchar', { array: true, default: [] })
    hobbies: string[];

    @Column({ type: 'bigint', nullable: true })
    bu_id: number;

    @Column({ type: 'boolean', default: true })
    is_active: boolean;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @ManyToOne(() => Bu, { nullable: true })
    @JoinColumn({ name: 'bu_id' })
    bu: Bu;

    @OneToMany(() => Post, (post) => post.author)
    posts: Post[];

    @OneToMany(() => Reply, (reply) => reply.author)
    replies: Reply[];

    @OneToMany(() => Upvote, (upvote) => upvote.user)
    upvotes: Upvote[];

    @OneToMany(() => ThreadUser, (threadUser) => threadUser.user)
    threadUsers: ThreadUser[];
}
