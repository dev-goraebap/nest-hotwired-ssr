// src/shared/active-storage/tests/active-storage.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';

import { LocalStorageAdapter } from '../adapters/local-storage.adapter';
import { ACTIVE_STORAGE_REPOSITORY } from '../interfaces/active-storage.repository';
import { STORAGE_ADAPTER } from '../interfaces/storage.adapter';
import { LocalActiveStorageRepository } from '../repositories/local-active-storage.repository';
import { ActiveStorageService } from '../services/active-storage.service';

describe('ActiveStorageService', () => {
  let service: ActiveStorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActiveStorageService,
        {
          provide: ACTIVE_STORAGE_REPOSITORY,
          useClass: LocalActiveStorageRepository,
        },
        { provide: STORAGE_ADAPTER, useClass: LocalStorageAdapter },
      ],
    }).compile();

    service = module.get<ActiveStorageService>(ActiveStorageService);
  });

  it('파일첨부 후 도메인 유형으로 첨부파일 목록들을 조회할 수 있어야한다.', async () => {
    // 1. 파일 첨부
    const file = await createRealMulterFile(
      'test.txt',
      'text/plain',
      'Hello World',
    );

    const attachment = await service.attach(file, 'TestRecord', '1', 'file');

    expect(attachment).toBeDefined();
    expect(attachment.id).toBeDefined();
    expect(attachment.recordType).toBe('TestRecord');
    expect(attachment.recordId).toBe('1');
    expect(attachment.name).toBe('file');
    expect(attachment.blob).toBeDefined();
    expect(attachment.blob.filename).toBe('test.txt');
    expect(attachment.blob.contentType).toBe('text/plain');

    // 2. 조회 테스트
    const results = await service.findAttachments('TestRecord');
    console.log('조회 결과:', results);

    expect(results).toHaveLength(1);
    expect(results[0].id).toBe(attachment.id);
    expect(results[0].blob.filename).toBe('test.txt');
  });

  // 실제 Express.Multer.File 객체 생성 헬퍼
  function createRealMulterFile(
    originalname: string = 'test.txt',
    mimetype: string = 'text/plain',
    content: string = 'test file content',
  ): Promise<Express.Multer.File> {
    return new Promise((resolve, reject) => {
      // 수동으로 파일 데이터 설정
      const buffer = Buffer.from(content);
      const file: Express.Multer.File = {
        fieldname: 'file',
        originalname,
        encoding: '7bit',
        mimetype,
        size: buffer.length,
        buffer,
        destination: '',
        filename: 'test.txt',
        path: '',
        stream: undefined as any,
      };
      resolve(file);
    });
  }
});
