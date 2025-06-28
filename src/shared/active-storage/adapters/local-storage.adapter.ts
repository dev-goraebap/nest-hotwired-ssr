import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

import { IStorageAdapter } from '../interfaces/storage.adapter';

@Injectable()
export class LocalStorageAdapter implements IStorageAdapter {
  private rootPath: string;
  private baseUrl: string;

  constructor() {
    // 기본값: 프로젝트 루트의 storage/uploads
    this.rootPath = path.join(process.cwd(), 'storage', 'uploads');
    // 기본값: /uploads (Express static 서빙을 위한)
    this.baseUrl = '/uploads';

    this.ensureRootDirectory();
  }

  getServiceName(): string {
    return 'local';
  }

  /**
   * 파일 업로드 (인터페이스 준수)
   */
  async store(key: string, file: Buffer): Promise<string> {
    await this.upload(key, file);
    return key;
  }

  /**
   * 파일 업로드 (내부 구현)
   */
  private async upload(key: string, data: Buffer): Promise<void> {
    const filePath = this.getFilePath(key);
    const dirPath = path.dirname(filePath);

    // 디렉토리 생성
    await fs.mkdir(dirPath, { recursive: true });

    if (Buffer.isBuffer(data)) {
      // Buffer 데이터 직접 저장
      await fs.writeFile(filePath, data);
    } else {
      throw new Error('fail file upload');
    }
  }

  /**
   * 키를 기반으로 파일 경로 생성
   * Rails Active Storage 스타일: ab/cd/abcd1234...
   */
  private getFilePath(key: string): string {
    // 키의 처음 4자리를 이용해 2단계 디렉토리 구조 생성
    const dir1 = key.substring(0, 2);
    const dir2 = key.substring(2, 4);
    return path.join(this.rootPath, dir1, dir2, key);
  }

  /**
   * 루트 디렉토리 생성 확인
   */
  private async ensureRootDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.rootPath, { recursive: true });
    } catch (error) {
      console.error('Storage root directory creation failed:', error);
    }
  }
}
