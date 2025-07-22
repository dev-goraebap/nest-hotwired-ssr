import { Injectable } from '@nestjs/common';
import { Storage, Bucket } from '@google-cloud/storage';

import { TypeormActiveStorageOptions } from '../../options.factory';
import { Utils } from '../../utils';
import { StoragePort } from '../ports/storage.port';

@Injectable()
export class GcsStorageAdapter implements StoragePort {
  private readonly storage: Storage;
  private readonly bucket: Bucket;

  constructor(private readonly options: TypeormActiveStorageOptions) {
    this.storage = new Storage({
      projectId: this.options.gcs?.projectId,
      keyFilename: this.options.gcs?.keyFilename,
    });

    if (!this.options.gcs?.bucketName) {
      throw new Error('GCS bucket name is required');
    }

    this.bucket = this.storage.bucket(this.options.gcs.bucketName);
  }

  getServiceName(): string {
    return 'gcs';
  }

  async store(key: string, data: Buffer): Promise<string> {
    try {
      // GCS에서도 계층적 경로 구조 사용 (ab/cd/abcdef...)
      const fileName = Utils.getGcsFilePath(key);
      const file = this.bucket.file(fileName);

      if (!Buffer.isBuffer(data)) {
        throw new Error('fail file upload: data must be Buffer');
      }

      // GCS에 파일 업로드
      await file.save(data, {
        metadata: {
          cacheControl: 'public, max-age=31536000', // 1년 캐시
        },
      });

      return key;
    } catch (error) {
      console.error(`Failed to upload file to GCS: ${key}`, error);
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const fileName = Utils.getGcsFilePath(key);
      const file = this.bucket.file(fileName);

      await file.delete();
    } catch (error: unknown) {
      // 파일이 존재하지 않는 경우는 무시 (이미 삭제됨)
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 404
      ) {
        return;
      }

      console.error(`Failed to delete file from GCS: ${key}`, error);
      throw error;
    }
  }
}
