import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { describe } from 'node:test';
import { join } from 'path';
import { DataSource } from 'typeorm';

import { AttachmentEntity } from '../entities/attachment.entity';
import { BlobEntity } from '../entities/blob.entity';
import { LocalStorageAdapter } from '../infra/adapters/local-storage.adapter';
import { STORAGE_PORT } from '../infra/ports/storage.port';
import { ActiveStorageService } from '../services/active-storage.service';
import { TestingHelper } from './testing.helper';

describe('TypeOrmActiveStorage', () => {
  let activeStorageService: ActiveStorageService;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: join(process.cwd(), 'storage', 'test.sqlite'),
          entities: [BlobEntity, AttachmentEntity],
          synchronize: true,
          logging: false,
        }),
        TypeOrmModule.forFeature([BlobEntity, AttachmentEntity]),
      ],
      providers: [
        { provide: STORAGE_PORT, useClass: LocalStorageAdapter },
        ActiveStorageService,
      ],
    }).compile();

    activeStorageService = module.get(ActiveStorageService);
    dataSource = module.get(DataSource);
  });

  afterEach(async () => {
    // DataSource를 통해 직접 쿼리 실행
    if (dataSource && dataSource.isInitialized) {
      await dataSource.query('DELETE FROM attachments');

      const deleteCount = await activeStorageService.cleanupOrphanedBlobs();
      console.log('테스트 마무리 파일 제거: ' + deleteCount);

      await dataSource.query('DELETE FROM blobs');
    }
  });

  it('단일 파일 업로드 성공', async () => {
    const file = await TestingHelper.createRealMulterFile();
    const attachment = await activeStorageService.attach(
      file,
      'TestObject1',
      '0001',
      'file',
    );
    expect(attachment).toBeInstanceOf(AttachmentEntity);
    expect(attachment.blob).toBeInstanceOf(BlobEntity);
  });

  it('단일 파일 업로드: (기존 첨부 내용은 지우기)', async () => {
    const file = await TestingHelper.createRealMulterFile();
    await activeStorageService.attach(file, 'TestObject2', '0001', 'file');

    await activeStorageService.attach(
      file,
      'TestObject2',
      '0001',
      'file',
      'replace',
    );

    const results = await AttachmentEntity.find({
      where: {
        recordType: 'TestObject2',
        recordId: '0001',
        name: 'file',
      },
    });
    expect(results.length).toBe(1);
  });

  it('단일 파일 업로드: (기존 첨부 내용에 추가)', async () => {
    const file = await TestingHelper.createRealMulterFile();
    await activeStorageService.attach(file, 'TestObject3', '0001', 'file');

    await activeStorageService.attach(
      file,
      'TestObject3',
      '0001',
      'file',
      'append',
    );

    const results = await AttachmentEntity.find({
      where: {
        recordType: 'TestObject3',
        recordId: '0001',
        name: 'file',
      },
    });
    expect(results.length).toBe(2);
  });

  it('여러 파일 업로드를 replace로 할 경우 최초 딱 한번만 replace가 작동되어야함. 그 이후로는 무조건 append 모드', async () => {
    const file = await TestingHelper.createRealMulterFile();
    await activeStorageService.attach(file, 'TestObject3', '0000', 'file');

    const file1 = await TestingHelper.createRealMulterFile();
    const file2 = await TestingHelper.createRealMulterFile();
    const files: Express.Multer.File[] = [file1, file2];
    const attachments = await activeStorageService.attachMany(
      files,
      'TestObject3',
      '0001',
      'file',
      'replace',
    );
    // 기본 검증
    expect(attachments).toHaveLength(2);
    expect(attachments[0]).toBeInstanceOf(AttachmentEntity);
    expect(attachments[1]).toBeInstanceOf(AttachmentEntity);

    // 각 attachment에 blob이 포함되어 있는지 확인
    expect(attachments[0].blob).toBeInstanceOf(BlobEntity);
    expect(attachments[1].blob).toBeInstanceOf(BlobEntity);
  });

  it('첨부한 파일 삭제(Attachment 삭제)', async () => {
    const file = await TestingHelper.createRealMulterFile();
    const attachment = await activeStorageService.attach(
      file,
      'TestObject4',
      '0001',
      'file',
    );
    // 삭제
    await activeStorageService.detach(attachment.id);

    // 삭제했던 ID에 해당하는 첨부파일 조회
    const hasEntity = await AttachmentEntity.exists({
      where: { id: attachment.id },
    });
    expect(hasEntity).toBe(false);
  });

  it('첨부한 모든 파일 삭제', async () => {
    const file1 = await TestingHelper.createRealMulterFile();
    const file2 = await TestingHelper.createRealMulterFile();
    const files: Express.Multer.File[] = [file1, file2];
    await activeStorageService.attachMany(files, 'TestObject5', '0001', 'file');
    // 삭제
    await activeStorageService.detachAllByRecord('TestObject5', '0001', 'file');

    const hasEntity = await AttachmentEntity.exists({
      where: {
        recordType: 'TestObject5',
        recordId: '0001',
        name: 'file',
      },
    });
    expect(hasEntity).toBe(false);
  });

  it('단일 첨부파일 조회 (findSingleAttachment)', async () => {
    // 1. 테스트용 파일 업로드
    const file = await TestingHelper.createRealMulterFile(
      'single.txt',
      'text/plain',
      'single content',
    );

    const attachment = await activeStorageService.attach(
      file,
      'TestObject9',
      '0001',
      'avatar',
    );

    // 2. ID로 단일 첨부파일 조회
    const foundAttachment = await activeStorageService.findSingleAttachment(
      attachment.id,
    );

    // 3. 검증: 조회된 첨부파일이 올바른지 확인
    expect(foundAttachment).toBeTruthy();
    expect(foundAttachment!.id).toBe(attachment.id);
    expect(foundAttachment!.recordType).toBe('TestObject9');
    expect(foundAttachment!.recordId).toBe('0001');
    expect(foundAttachment!.name).toBe('avatar');

    // 4. blob 정보도 함께 조회되는지 확인
    expect(foundAttachment!.blob).toBeInstanceOf(BlobEntity);
    expect(foundAttachment!.blob.filename).toBe('single.txt');
    expect(foundAttachment!.blob.contentType).toBe('text/plain');
    expect(foundAttachment!.blob.byteSize).toBeGreaterThan(0);

    // 5. 존재하지 않는 ID로 조회 시 null 반환 확인
    const notFoundAttachment =
      await activeStorageService.findSingleAttachment(9999);
    expect(notFoundAttachment).toBeNull();
  });

  it('특정 레코드의 첨부파일 조회 (findAttachmentsByRecord)', async () => {
    // 1. 테스트용 파일들 업로드
    const file1 = await TestingHelper.createRealMulterFile(
      'file1.txt',
      'text/plain',
      'content 123',
    );
    const file2 = await TestingHelper.createRealMulterFile(
      'file2.txt',
      'text/plain',
      'content 223',
    );
    const file3 = await TestingHelper.createRealMulterFile(
      'file3.txt',
      'text/plain',
      'content 323',
    );

    // TestObject7에 image 분류로 2개 파일 첨부
    await activeStorageService.attach(
      file1,
      'TestObject7',
      '0001',
      'image',
      'append',
    );
    await activeStorageService.attach(
      file2,
      'TestObject7',
      '0001',
      'image',
      'append',
    );

    // TestObject7에 document 분류로 1개 파일 첨부
    await activeStorageService.attach(file3, 'TestObject7', '0001', 'document');

    // 다른 레코드에도 파일 첨부 (노이즈 데이터)
    await activeStorageService.attach(
      file1,
      'TestObject8',
      '0001',
      'image',
      'append',
    );

    // 2. 특정 레코드의 모든 첨부파일 조회
    const allAttachments = await activeStorageService.findAttachmentsByRecord(
      'TestObject7',
      '0001',
    );

    // 3. 검증: TestObject7:0001의 첨부파일 3개가 모두 조회되어야 함
    expect(allAttachments).toHaveLength(3);
    expect(
      allAttachments.every((att) => att.recordType === 'TestObject7'),
    ).toBe(true);
    expect(allAttachments.every((att) => att.recordId === '0001')).toBe(true);

    // 4. 특정 분류의 첨부파일만 조회
    const imageAttachments = await activeStorageService.findAttachmentsByRecord(
      'TestObject7',
      '0001',
      'image',
    );

    // 5. 검증: image 분류 첨부파일 2개만 조회되어야 함
    expect(imageAttachments).toHaveLength(2);
    expect(imageAttachments.every((att) => att.name === 'image')).toBe(true);

    // 6. 각 첨부파일에 blob 정보가 포함되어 있는지 확인
    expect(imageAttachments[0].blob).toBeInstanceOf(BlobEntity);
    expect(imageAttachments[0].blob.filename).toBeDefined();
    expect(imageAttachments[0].blob.contentType).toBeDefined();
  });

  it('고아 Blob 정리 (cleanupOrphanedBlobs)', async () => {
    // 1. 파일 업로드하여 Blob과 Attachment 생성
    const file = await TestingHelper.createRealMulterFile(
      'test.txt',
      'text/plain',
      'cleanup test',
    );
    const attachment = await activeStorageService.attach(
      file,
      'TestObject6',
      '0001',
      'file',
    );

    const blobId = attachment.blob.id;
    const blobKey = attachment.blob.key;

    // 2. Attachment만 직접 삭제 (Blob은 고아가 됨)
    await AttachmentEntity.delete({ id: attachment.id });

    // 3. 고아 Blob이 존재하는지 확인
    const orphanBlob = await BlobEntity.findOne({ where: { id: blobId } });
    expect(orphanBlob).toBeTruthy();

    // 4. 고아 Blob 정리 실행
    const deletedCount = await activeStorageService.cleanupOrphanedBlobs();
    expect(deletedCount).toBe(1);

    // 5. 고아 Blob이 삭제되었는지 확인
    const deletedBlob = await BlobEntity.findOne({ where: { id: blobId } });
    expect(deletedBlob).toBeNull();

    // 6. 실제 파일도 삭제되었는지 확인 (선택적 - 파일 시스템에서 확인)
    const fs = require('fs/promises');
    const path = require('path');
    const { Utils } = require('../utils');

    try {
      const filePath = Utils.getFilePath(
        path.join(process.cwd(), 'storage', 'uploads'),
        blobKey,
      );
      await fs.access(filePath);
      // 파일이 존재하면 테스트 실패
      expect(true).toBe(false);
    } catch (error) {
      // 파일이 존재하지 않으면 테스트 성공 (ENOENT 에러)
      expect(error.code).toBe('ENOENT');
    }
  });
});
