import { Inject, Injectable } from '@nestjs/common';

import { IStorageAdapter } from '../interfaces/storage-adapter.interface';
import { AttachmentEntity } from '../models/attachment.entity';
import { BlobEntity } from '../models/blob.entity';

/**
 * ActiveStorageService
 * 
 * TypeORM Active Record 패턴으로 모델에서 직접 DB 작업 수행
 * Rails Active Storage와 유사한 API 제공
 */
@Injectable()
export class ActiveStorageService {
  constructor(
    @Inject('IStorageAdapter') 
    private readonly storageAdapter: IStorageAdapter
  ) {}

  /**
   * 파일을 업로드하고 모델에 첨부 (Rails의 attach 메서드와 유사)
   */
  async attach(
    recordType: string,
    recordId: string,
    file: Express.Multer.File,
    name: string = 'default',
    attachmentType: 'single' | 'multiple' = 'single'
  ): Promise<AttachmentEntity> {
    // 1. single 타입인 경우 기존 첨부파일 제거
    if (attachmentType === 'single') {
      await AttachmentEntity.deleteByRecordAndName(recordType, recordId, name);
    }

    // 2. 중복 파일 체크 (같은 checksum을 가진 blob이 있는지)
    const checksum = require('crypto').createHash('md5').update(file.buffer).digest('hex');
    let blob = await BlobEntity.findByChecksum(checksum);

    if (!blob) {
      // 새 파일인 경우 저장
      blob = await BlobEntity.createFromFile(
        file.buffer,
        file.originalname,
        file.mimetype,
        this.storageAdapter.getServiceName()
      );
      
      // 실제 파일 저장
      await this.storageAdapter.store(blob.key, file.buffer);
    }

    // 3. Attachment 생성 및 저장
    const attachment = await AttachmentEntity.createNew(
      recordType,
      recordId,
      blob.id,
      name,
      attachmentType
    );

    return attachment;
  }

  /**
   * 여러 파일을 한번에 첨부
   */
  async attachMany(
    recordType: string,
    recordId: string,
    files: Express.Multer.File[],
    name: string = 'documents'
  ): Promise<AttachmentEntity[]> {
    const attachments: AttachmentEntity[] = [];

    for (const file of files) {
      const attachment = await this.attach(
        recordType,
        recordId,
        file,
        name,
        'multiple'
      );
      attachments.push(attachment);
    }

    return attachments;
  }

  /**
   * 특정 레코드의 첨부파일들 조회
   */
  async findAttachments(
    recordType: string,
    recordId: string,
    name?: string
  ): Promise<AttachmentEntity[]> {
    return await AttachmentEntity.findByRecord(recordType, recordId, name);
  }

  /**
   * has_one_attached 패턴으로 단일 첨부파일 조회
   */
  async findSingleAttachment(
    recordType: string,
    recordId: string,
    name: string
  ): Promise<AttachmentEntity | null> {
    return await AttachmentEntity.findSingleAttachment(recordType, recordId, name);
  }

  /**
   * has_many_attached 패턴으로 복수 첨부파일들 조회
   */
  async findMultipleAttachments(
    recordType: string,
    recordId: string,
    name: string
  ): Promise<AttachmentEntity[]> {
    return await AttachmentEntity.findMultipleAttachments(recordType, recordId, name);
  }

  /**
   * 첨부파일의 공개 URL 생성
   */
  async getFileUrl(
    attachmentId: string,
    options?: Record<string, any>
  ): Promise<string> {
    const attachment = await AttachmentEntity.findOne({ 
      where: { id: attachmentId },
      relations: ['blob']
    });
    
    if (!attachment) {
      throw new Error('Attachment not found');
    }

    const url = this.storageAdapter.getUrl(attachment.blob.key, options);
    return typeof url === 'string' ? url : await url;
  }

  /**
   * 첨부파일 제거
   */
  async detach(attachmentId: string, deleteFile: boolean = false): Promise<void> {
    const attachment = await AttachmentEntity.findOne({ 
      where: { id: attachmentId },
      relations: ['blob']
    });
    
    if (!attachment) {
      throw new Error('Attachment not found');
    }

    if (deleteFile) {
      await attachment.deleteWithCleanup();
      await this.storageAdapter.delete(attachment.blob.key);
    } else {
      await attachment.remove();
    }
  }

  /**
   * 특정 이름의 모든 첨부파일 제거
   */
  async detachByName(
    recordType: string,
    recordId: string,
    name: string,
    deleteFiles: boolean = false
  ): Promise<void> {
    const attachments = await AttachmentEntity.findByRecord(recordType, recordId, name);

    for (const attachment of attachments) {
      if (deleteFiles) {
        await attachment.deleteWithCleanup();
        await this.storageAdapter.delete(attachment.blob.key);
      } else {
        await attachment.remove();
      }
    }
  }

  /**
   * 파일 다운로드
   */
  async downloadFile(attachmentId: string): Promise<Buffer> {
    const attachment = await AttachmentEntity.findOne({ 
      where: { id: attachmentId },
      relations: ['blob']
    });
    
    if (!attachment) {
      throw new Error('Attachment not found');
    }

    return await this.storageAdapter.retrieve(attachment.blob.key);
  }

  /**
   * 첨부파일이 존재하는지 확인
   */
  async hasAttached(
    recordType: string,
    recordId: string,
    name: string
  ): Promise<boolean> {
    const attachments = await AttachmentEntity.findByRecord(recordType, recordId, name);
    return attachments.length > 0;
  }

  /**
   * 사용되지 않는 Blob들 정리
   */
  async cleanupUnusedBlobs(): Promise<number> {
    return await BlobEntity.deleteUnused();
  }
}
