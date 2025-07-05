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
    console.log(this.slug);
    // slug에 '/'가 있는지 확인
    if (this.slug.includes('/')) {
      console.log(`/${this.slug}`);
      return `/${this.slug}`; // 이미 '/'가 있다면 그대로 반환
    } else {
      // '/'가 없다면 '/documents/' 경로 추가
      console.log(`/documents/${this.slug}`);
      return `/documents/${this.slug}`;
    }
  }
}
