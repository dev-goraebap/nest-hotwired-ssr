import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TagEntity } from './tag.entity';
import { PostTranslationEntity } from './post-translation.entity';
import { SeriesEntity } from './series.entity';

@Entity({ name: 'posts' })
export class PostEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  readonly id: number;

  @Column({ unique: true })
  readonly slug: string;

  @Column({ default: false })
  readonly isPublished: boolean;

  @Column({ nullable: true })
  readonly publishedAt: Date;

  @Column({ nullable: true })
  readonly seriesOrder: number;

  @CreateDateColumn()
  readonly createdAt: Date;

  @UpdateDateColumn()
  readonly updatedAt: Date;

  @ManyToOne(() => SeriesEntity, (series) => series.posts, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'series_id' })
  readonly series: SeriesEntity;

  @ManyToMany(() => TagEntity, (tag) => tag.posts)
  @JoinTable({
    name: 'post_tags',
    joinColumn: { name: 'post_id' },
    inverseJoinColumn: { name: 'tag_id' },
  })
  readonly tags: TagEntity[];

  @OneToMany(() => PostTranslationEntity, (t) => t.post, {
    cascade: true,
  })
  readonly translations: PostTranslationEntity[];

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

  get excerpt() {
    return this.translation?.excerpt || '';
  }

  getUrl() {
    return `/posts/${this.slug}`;
  }
}
