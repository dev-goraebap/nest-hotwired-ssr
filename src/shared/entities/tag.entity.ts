import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PostEntity } from './post.entity';

@Entity({ name: 'tags' })
export class TagEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  readonly id: number;

  @Column({ unique: true })
  readonly name: string;

  @Column({ nullable: true })
  readonly description: string;

  @Column({ default: '#000000' })
  readonly color: string;

  @CreateDateColumn()
  readonly createdAt: Date;

  @UpdateDateColumn()
  readonly updatedAt: Date;

  @ManyToMany(() => PostEntity, (post) => post.tags)
  readonly posts: PostEntity[];
}
