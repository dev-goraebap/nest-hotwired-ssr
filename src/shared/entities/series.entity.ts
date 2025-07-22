import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PostEntity } from './post.entity';
import { SeriesTranslationEntity } from './series-translation.entity';

@Entity({ name: 'series' })
export class SeriesEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  readonly id: number;

  @Column({ unique: true })
  readonly slug: string;

  @Column({ default: false })
  readonly isCompleted: boolean;

  @CreateDateColumn()
  readonly createdAt: Date;

  @UpdateDateColumn()
  readonly updatedAt: Date;

  @OneToMany(() => PostEntity, (post) => post.series)
  readonly posts: PostEntity[];

  @OneToMany(() => SeriesTranslationEntity, (t) => t.series, {
    cascade: true,
  })
  readonly translations: SeriesTranslationEntity[];

  /**
   * 서비스를 통해 이미 현재 언어코드조건을 사용했다고 가정
   */
  get translation() {
    return this.translations[0];
  }

  get title() {
    return this.translation?.title || '';
  }

  get description() {
    return this.translation?.description || '';
  }
}
