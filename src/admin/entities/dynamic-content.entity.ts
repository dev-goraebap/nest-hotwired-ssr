import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'dynamic_contents' })
export class DynamicContentEntity {
  @PrimaryColumn()
  readonly id: string;

  @Column()
  readonly screenType: string; // 'main', 'detail', etc.

  @Column()
  readonly contentType: string; // 'A', 'B', etc.

  @Column({ type: 'text' })
  readonly content: string;

  @Column()
  readonly useYn: 'Y' | 'N';

  @CreateDateColumn()
  readonly createdAt: Date;

  @UpdateDateColumn()
  readonly updatedAt: Date;
}
