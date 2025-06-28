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
   * 
   * @param key 파일 키 (예: "abcd1234ef567890")
   * @returns 파일 경로 (예: "/storage/uploads/ab/cd/abcd1234ef567890")
   * 
   * 이 구조의 장점들 (GPT 선생님의 말씀):
   * 1. 파일시스템 성능 최적화
   *    - 한 디렉토리에 수만개 파일이 있으면 파일 검색 속도가 급격히 느려짐
   *    - 2단계 디렉토리로 분산하면 각 디렉토리당 최대 256개 하위폴더
   *    - 예: 100만개 파일을 256×256=65,536개 폴더에 분산 저장
   * 
   * 2. 균등한 분산
   *    - 16진수 기반이므로 0-f까지 균등하게 분산됨
   *    - 특정 폴더에 파일이 몰리는 현상 방지
   * 
   * 3. 확장성
   *    - 필요시 3단계(ab/cd/ef/abcdef...)로 쉽게 확장 가능
   *    - Git 객체 저장소와 동일한 방식 (proven pattern)
   * 
   * 4. 백업/동기화 효율성
   *    - 디렉토리 단위로 병렬 처리 가능
   *    - rsync 등 도구 사용시 효율적
   * 
   * 5. 운영 관리 편의성
   *    - 파일 개수를 디렉토리 단위로 쉽게 파악 가능
   *    - 특정 시간대 파일들을 디렉토리로 구분 가능
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
