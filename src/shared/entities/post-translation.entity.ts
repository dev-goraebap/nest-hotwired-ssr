import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PostEntity } from './post.entity';

@Entity({ name: 'post_translations' })
@Index(['post', 'languageCode'], { unique: true })
export class PostTranslationEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  readonly id: number;

  @Column({ length: 5 })
  readonly languageCode: string;

  @Column()
  readonly title: string;

  @Column({ type: 'text' })
  readonly content: string;

  @Column({ nullable: true })
  readonly excerpt: string;

  @CreateDateColumn()
  readonly createdAt: Date;

  @UpdateDateColumn()
  readonly updatedAt: Date;

  @ManyToOne(() => PostEntity, (p) => p.translations, {
    onDelete: 'CASCADE',
  })
  readonly post: PostEntity;
}
