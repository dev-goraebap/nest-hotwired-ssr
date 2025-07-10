import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DocumentEntity } from './document.entity';
import { CategoryTranslationEntity } from './category-translation.entity';

@Entity({ name: 'categories' })
export class CategoryEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  readonly id: number;

  @Column()
  readonly name: string;

  @Column()
  readonly description: string;

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
}
