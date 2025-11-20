import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { User } from '../users/user.entity';
import { Thread } from '../threads/thread.entity';
import { Post } from '../posts/post.entity';

@Entity('bu')
export class Bu {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', unique: true })
  name: string;

  @OneToMany(() => User, (user) => user.bu)
  users: User[];

  @OneToMany(() => Thread, (thread) => thread.bu)
  threads: Thread[];

  @OneToMany(() => Post, (post) => post.bu)
  posts: Post[];
}
