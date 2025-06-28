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

/**
 * Attachment Entity (Active Record Pattern)
 *
 * 파일과 모델 간의 관계를 정의하는 TypeORM 엔티티
 * Active Record 패턴으로 모델 자체에서 DB 작업 수행
 */
@Entity('attachments')
export class AttachmentEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ name: 'record_type' })
  recordType: string;

  @Column({ name: 'record_id' })
  recordId: string;

  @Column({ name: 'blob_id' })
  blobId: string;

  @Column({
    name: 'attachment_type',
    type: 'varchar',
    enum: ['single', 'multiple'],
    default: 'single',
  })
  attachmentType: 'single' | 'multiple';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relationships
  @ManyToOne(() => BlobEntity, (blob) => blob.attachments, { eager: true })
  @JoinColumn({ name: 'blob_id' })
  blob: BlobEntity;

  /**
   * 새로운 Attachment 생성 및 저장
   */
  static async createNew(
    recordType: string,
    recordId: string,
    blobId: string,
    name: string = 'default',
    attachmentType: 'single' | 'multiple' = 'single',
  ): Promise<AttachmentEntity> {
    const attachment = new AttachmentEntity();
    attachment.recordType = recordType;
    attachment.recordId = recordId;
    attachment.blobId = blobId;
    attachment.name = name;
    attachment.attachmentType = attachmentType;

    return await attachment.save();
  }

  /**
   * 특정 레코드의 첨부파일들 조회
   */
  static async findByRecord(
    recordType: string,
    recordId: string,
    name?: string,
  ): Promise<AttachmentEntity[]> {
    const query = AttachmentEntity.createQueryBuilder('attachment')
      .leftJoinAndSelect('attachment.blob', 'blob')
      .where('attachment.recordType = :recordType', { recordType })
      .andWhere('attachment.recordId = :recordId', { recordId });

    if (name) {
      query.andWhere('attachment.name = :name', { name });
    }

    return await query.orderBy('attachment.createdAt', 'ASC').getMany();
  }

  /**
   * has_one_attached 패턴으로 단일 첨부파일 조회
   */
  static async findSingleAttachment(
    recordType: string,
    recordId: string,
    name: string,
  ): Promise<AttachmentEntity | null> {
    return await AttachmentEntity.createQueryBuilder('attachment')
      .leftJoinAndSelect('attachment.blob', 'blob')
      .where('attachment.recordType = :recordType', { recordType })
      .andWhere('attachment.recordId = :recordId', { recordId })
      .andWhere('attachment.name = :name', { name })
      .andWhere('attachment.attachmentType = :attachmentType', {
        attachmentType: 'single',
      })
      .getOne();
  }

  /**
   * has_many_attached 패턴으로 복수 첨부파일들 조회
   */
  static async findMultipleAttachments(
    recordType: string,
    recordId: string,
    name: string,
  ): Promise<AttachmentEntity[]> {
    return await AttachmentEntity.createQueryBuilder('attachment')
      .leftJoinAndSelect('attachment.blob', 'blob')
      .where('attachment.recordType = :recordType', { recordType })
      .andWhere('attachment.recordId = :recordId', { recordId })
      .andWhere('attachment.name = :name', { name })
      .andWhere('attachment.attachmentType = :attachmentType', {
        attachmentType: 'multiple',
      })
      .orderBy('attachment.createdAt', 'ASC')
      .getMany();
  }

  /**
   * 특정 레코드의 소유인지 확인
   */
  isOwnedBy(recordType: string, recordId: string): boolean {
    return this.recordType === recordType && this.recordId === recordId;
  }

  /**
   * has_one_attached 패턴인지 확인
   */
  isSingleAttachment(): boolean {
    return this.attachmentType === 'single';
  }

  /**
   * has_many_attached 패턴인지 확인
   */
  isMultipleAttachment(): boolean {
    return this.attachmentType === 'multiple';
  }

  /**
   * 생성된 지 얼마나 되었는지 계산
   */
  getAge(): number {
    return Date.now() - this.createdAt.getTime();
  }

  /**
   * 특정 레코드의 특정 이름의 모든 첨부파일 삭제
   */
  static async deleteByRecordAndName(
    recordType: string,
    recordId: string,
    name: string,
  ): Promise<number> {
    const attachments = await AttachmentEntity.findByRecord(
      recordType,
      recordId,
      name,
    );

    if (attachments.length > 0) {
      await AttachmentEntity.remove(attachments);
    }

    return attachments.length;
  }

  /**
   * 특정 레코드의 모든 첨부파일 삭제
   */
  static async deleteByRecord(
    recordType: string,
    recordId: string,
  ): Promise<number> {
    const attachments = await AttachmentEntity.findByRecord(
      recordType,
      recordId,
    );

    if (attachments.length > 0) {
      await AttachmentEntity.remove(attachments);
    }

    return attachments.length;
  }

  /**
   * 첨부파일 삭제 후 사용되지 않는 Blob도 정리
   */
  async deleteWithCleanup(): Promise<void> {
    const blobId = this.blobId;
    await this.remove();

    // 같은 blob을 참조하는 다른 attachment가 있는지 확인
    const otherAttachments = await AttachmentEntity.findOne({
      where: { blobId },
    });

    // 다른 참조가 없으면 blob도 삭제
    if (!otherAttachments) {
      const blob = await BlobEntity.findOne({ where: { id: blobId } });
      if (blob) {
        await blob.remove();
      }
    }
  }
}
