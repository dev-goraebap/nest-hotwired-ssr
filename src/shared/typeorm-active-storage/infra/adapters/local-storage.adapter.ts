import { Inject, Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

import { TYPEORM_ACTIVE_STORAGE_OPTIONS, TypeormActiveStorageOptions } from '../../options.factory';
import { Utils } from '../../utils';
import { StoragePort } from '../ports/storage.port';

@Injectable()
export class LocalStorageAdapter implements StoragePort {

  constructor(
    @Inject(TYPEORM_ACTIVE_STORAGE_OPTIONS)
    private readonly options: TypeormActiveStorageOptions
  ) {
    this.ensureRootDirectory();
  }

  getServiceName(): string {
    return 'local';
  }

  async store(key: string, data: Buffer): Promise<string> {
    const filePath = Utils.getFilePath(this.options.storageRootPath, key);
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
      const filePath = Utils.getFilePath(this.options.storageRootPath, key);
      await fs.unlink(filePath);

      // 폴더 정리: 파일 삭제 후 빈 폴더라면 상위 폴더까지 재귀적으로 삭제
      let dir = path.dirname(filePath);
      while (dir !== this.options.storageRootPath) {
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
      await fs.mkdir(this.options.storageRootPath, { recursive: true });
    } catch (error) {
      console.error('Storage root directory creation failed:', error);
    }
  }
}
