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
import { TagEntity } from './tag.entity';

@Entity({ name: 'tag_translations' })
@Index(['tag', 'languageCode'], { unique: true })
export class TagTranslationEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  readonly id: number;

  @Column({ length: 5 })
  readonly languageCode: string;

  @Column()
  readonly name: string;

  @Column({ nullable: true })
  readonly description: string;

  @CreateDateColumn()
  readonly createdAt: Date;

  @UpdateDateColumn()
  readonly updatedAt: Date;

  @ManyToOne(() => TagEntity, (t) => t.translations, {
    onDelete: 'CASCADE',
  })
  readonly tag: TagEntity;
}
