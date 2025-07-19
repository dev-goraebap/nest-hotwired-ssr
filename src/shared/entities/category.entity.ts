import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CategoryTranslationEntity } from './category-translation.entity';
import { DocumentEntity } from './document.entity';

@Entity({ name: 'categories' })
export class CategoryEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  readonly id: number;

  @Column()
  readonly order: number;

  @CreateDateColumn()
  readonly createdAt: Date;

  @UpdateDateColumn()
  readonly updatedAt: Date;

  @OneToMany(() => DocumentEntity, (e) => e.category)
  readonly documents: DocumentEntity[];

  @OneToMany(() => CategoryTranslationEntity, (e) => e.category, {
    cascade: true,
  })
  readonly translations: CategoryTranslationEntity[];

  /**
   * 서비스를 통해 이미 현재 언어코드조건을 사용했다고 가정
   */
  get translation() {
    return this.translations[0];
  }

  // 편의 속성들도 추가할 수 있음
  get name() {
    return this.translation?.name || '';
  }

  get description() {
    return this.translation?.description || '';
  }
}
