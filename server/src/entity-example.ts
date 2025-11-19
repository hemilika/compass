import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('bundles')
export class Bundle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  price: number;

  @Column()
  final_price: number;

  @Column()
  thumbnail: string;

  @Column('text', { array: true, nullable: true })
  images: string[];

  @Column('text')
  description: string;

  @Column()
  category: string;

  @Column({ default: false })
  discount: boolean;

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'jsonb', nullable: true })
  attributes: Record<string, any>;
}
