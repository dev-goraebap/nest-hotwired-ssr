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
import { SeriesEntity } from './series.entity';

@Entity({ name: 'series_translations' })
@Index(['series', 'languageCode'], { unique: true })
export class SeriesTranslationEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  readonly id: number;

  @Column({ length: 5 })
  readonly languageCode: string;

  @Column()
  readonly title: string;

  @Column({ nullable: true })
  readonly description: string;

  @CreateDateColumn()
  readonly createdAt: Date;

  @UpdateDateColumn()
  readonly updatedAt: Date;

  @ManyToOne(() => SeriesEntity, (s) => s.translations, {
    onDelete: 'CASCADE',
  })
  readonly series: SeriesEntity;
}
