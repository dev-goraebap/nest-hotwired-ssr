import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CategoryEntity } from './category.entity';
import { DocumentTranslationEntity } from './document-translation.entity';

@Entity({ name: 'documents' })
export class DocumentEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  readonly id: number;

  @Column({ unique: true })
  readonly slug: string;

  @Column({ default: true })
  readonly isDraft: boolean;

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

  @OneToMany(() => DocumentTranslationEntity, (e) => e.document, {
    cascade: true,
  })
  readonly translations: DocumentTranslationEntity[];

  /**
   * 서비스를 통해 이미 현재 언어코드조건을 사용했다고 가정
   */
  get translation() {
    return this.translations[0];
  }

  get title() {
    return this.translation?.title || '';
  }

  get content() {
    return this.translation?.content || '';
  }

  getUrl() {
    if (this.slug.includes('/')) {
      return `/${this.slug}`;
    } else {
      return `/documents/${this.slug}`;
    }
  }
}
