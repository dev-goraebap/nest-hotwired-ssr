import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LocalStorageAdapter } from './adapters/local-storage.adapter';
import { AttachmentEntity } from './models/attachment.entity';
import { BlobEntity } from './models/blob.entity';
import { ActiveStorageService } from './services/active-storage.service';

/**
 * Active Storage Module
 *
 * Rails Active Storage 스타일의 파일 첨부 시스템을 NestJS에서 제공
 * TypeORM Active Record 패턴 사용
 *
 * @description
 * - AttachmentService: 파일 첨부/해제/조회 등 비즈니스 로직 (Active Record 기반)
 * - AttachmentEntity, BlobEntity: Active Record 패턴으로 DB 작업 수행
 * - StorageAdapter: 실제 파일 저장 (기본: 로컬 파일시스템, 확장: S3/GCS)
 */
@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      BlobEntity, 
      AttachmentEntity
    ])
  ],
  providers: [
    ActiveStorageService,
    {
      provide: 'IStorageAdapter',
      useClass: LocalStorageAdapter,
    },
  ],
  exports: [ActiveStorageService, 'IStorageAdapter'],
})
export class ActiveStorageModule {}
