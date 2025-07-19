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
import { DocumentEntity } from './document.entity';

@Entity({ name: 'document_translations' })
@Index(['document', 'languageCode'], { unique: true })
export class DocumentTranslationEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  readonly id: number;

  @Column({ length: 5 })
  readonly languageCode: string;

  @Column()
  readonly title: string;

  @Column({ type: 'text' })
  readonly content: string;

  @CreateDateColumn()
  readonly createdAt: Date;

  @UpdateDateColumn()
  readonly updatedAt: Date;

  @ManyToOne(() => DocumentEntity, (d) => d.translations)
  readonly document: DocumentEntity;
}
