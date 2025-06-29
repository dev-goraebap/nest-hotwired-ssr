import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BlobEntity } from './blob.entity';

@Entity({ name: 'attachments' })
export class AttachmentEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  readonly id: number; // 고유한 첨부ID

  @Column()
  readonly name: string; // 파일분류이름 image, document 등등, 조회에 관련되어 사용

  @Column({ name: 'record_type' })
  readonly recordType: string; // 파일을 사용하는 도메인 타입 (user, post, test ...)

  @Column({ name: 'record_id' })
  readonly recordId: string; // 도메인의 특정 레코드 ID

  @Column({ name: 'blob_id' })
  readonly blobId: number; // 파일의 특정 레코드 ID

  @CreateDateColumn()
  readonly createdAt: Date; // 생성일

  @ManyToOne(() => BlobEntity, (e) => e.attachments)
  @JoinColumn({ name: 'blob_id' })
  readonly blob: BlobEntity;
}
