import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PostEntity } from './post.entity';
import { TagTranslationEntity } from './tag-translation.entity';

@Entity({ name: 'tags' })
export class TagEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  readonly id: number;

  @Column({ unique: true })
  readonly slug: string;

  @Column({ default: '#000000' })
  readonly color: string;

  @CreateDateColumn()
  readonly createdAt: Date;

  @UpdateDateColumn()
  readonly updatedAt: Date;

  @ManyToMany(() => PostEntity, (post) => post.tags)
  readonly posts: PostEntity[];

  @OneToMany(() => TagTranslationEntity, (t) => t.tag, {
    cascade: true,
  })
  readonly translations: TagTranslationEntity[];

  /**
   * 서비스를 통해 이미 현재 언어코드조건을 사용했다고 가정
   */
  get translation() {
    return this.translations[0];
  }

  get name() {
    return this.translation?.name || '';
  }

  get description() {
    return this.translation?.description || '';
  }
}