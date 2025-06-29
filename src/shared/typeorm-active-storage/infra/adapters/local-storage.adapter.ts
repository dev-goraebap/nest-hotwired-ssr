import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

import { Utils } from '../../utils';
import { StoragePort } from '../ports/storage.port';

@Injectable()
export class LocalStorageAdapter implements StoragePort {
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

  async store(key: string, data: Buffer): Promise<string> {
    const filePath = Utils.getFilePath(this.rootPath, key);
    const dirPath = path.dirname(filePath);

    // 디렉토리 생성
    await fs.mkdir(dirPath, { recursive: true });

    if (Buffer.isBuffer(data)) {
      // Buffer 데이터 직접 저장
      await fs.writeFile(filePath, data);
    } else {
      throw new Error('fail file upload');
    }

    return key;
  }

  async delete(key: string): Promise<void> {
    try {
      const filePath = Utils.getFilePath(this.rootPath, key);
      await fs.unlink(filePath);

      // 폴더 정리: 파일 삭제 후 빈 폴더라면 상위 폴더까지 재귀적으로 삭제
      let dir = path.dirname(filePath);
      while (dir !== this.rootPath) {
        const files = await fs.readdir(dir);
        if (files.length === 0) {
          await fs.rmdir(dir);
          dir = path.dirname(dir);
        } else {
          break;
        }
      }
    } catch (error) {
      // 파일이 존재하지 않는 경우는 무시 (이미 삭제됨)
      if (error.code !== 'ENOENT') {
        console.error(`Failed to delete file: ${key}`, error);
        throw error;
      }
    }
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
