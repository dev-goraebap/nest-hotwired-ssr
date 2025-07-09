import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CategoryEntity } from './category.entity';

@Entity({ name: 'documents' })
export class DocumentEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  readonly id: number;

  @Column({ unique: true })
  readonly slug: string;

  @Column({ unique: true })
  readonly title: string;

  @Column({ type: 'text' })
  readonly content: string;

  @CreateDateColumn()
  readonly createdAt: Date;

  @UpdateDateColumn()
  readonly updatedAt: Date;

  @ManyToOne(() => CategoryEntity, (e) => e.documents, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'category_id' })
  readonly category: CategoryEntity;

  getUrl() {
    if (this.slug.includes('/')) {
      return `/${this.slug}`;
    } else {
      return `/documents/${this.slug}`;
    }
  }
}
