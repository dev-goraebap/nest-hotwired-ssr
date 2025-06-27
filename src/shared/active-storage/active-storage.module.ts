import { Module } from '@nestjs/common';
import { LocalStorageAdapter } from './adapters/local-storage.adapter';
import { MemoryAttachmentRepository } from './repositories/memory-attachment.repository';
import { AttachmentService } from './services/attachment.service';

/**
 * Active Storage Module
 * 
 * Rails Active Storage 스타일의 파일 첨부 시스템을 NestJS에서 제공
 * 
 * @description
 * - AttachmentService: 파일 첨부/해제/조회 등 비즈니스 로직
 * - Repository: Attachment/Blob 메타데이터 저장 (기본: 메모리, 확장: SQLite/TypeORM)
 * - StorageAdapter: 실제 파일 저장 (기본: 로컬 파일시스템, 확장: S3/GCS)
 * 
 * @example
 * // 기본 사용법
 * constructor(private attachmentService: AttachmentService) {}
 * 
 * // 파일 첨부
 * await this.attachmentService.attach('User', '123', 'avatar', file);
 * 
 * // 파일 조회
 * const attachment = await this.attachmentService.find('User', '123', 'avatar');
 */
@Module({
  providers: [
    AttachmentService,
    {
      provide: 'IAttachmentRepository',
      useClass: MemoryAttachmentRepository,
    },
    {
      provide: 'IStorageAdapter', 
      useClass: LocalStorageAdapter,
    },
  ],
  exports: [
    AttachmentService,
    'IAttachmentRepository',
    'IStorageAdapter',
  ],
})
export class ActiveStorageModule {}
