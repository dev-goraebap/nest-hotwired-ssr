import { Injectable } from '@nestjs/common';
import { createReadStream, createWriteStream } from 'fs';
import * as fs from 'fs/promises';
import * as path from 'path';
import { pipeline } from 'stream/promises';

import { IStorageAdapter } from '../interfaces/storage-adapter.interface';

/**
 * 로컬 파일 시스템 기반 Storage Adapter 구현체
 * 
 * 서버의 로컬 파일 시스템에 파일을 저장하고 관리
 * Rails Active Storage의 Disk Service와 유사한 역할
 * 
 * @description
 * - 파일을 지정된 루트 디렉토리 하위에 저장
 * - 파일 키 기반으로 디렉토리 구조 생성 (예: ab/cd/abcd1234...)
 * - 스트림 기반 업로드/다운로드 지원
 * - URL 생성 (로컬 서빙을 위한)
 */
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
   * 파일 업로드 (인터페이스 준수)
   */
  async store(key: string, file: Buffer): Promise<string> {
    await this.upload(key, file);
    return key;
  }

  /**
   * 파일 다운로드 (인터페이스 준수)
   */
  async retrieve(key: string): Promise<Buffer> {
    return this.download(key);
  }

  /**
   * 파일 URL 생성 (인터페이스 준수)
   */
  getUrl(key: string, options?: Record<string, any>): string {
    return this.url(key);
  }

  /**
   * 서비스명 반환 (인터페이스 준수)
   */
  getServiceName(): string {
    return 'local';
  }

  /**
   * 파일 업로드 (내부 구현)
   */
  private async upload(key: string, data: Buffer | NodeJS.ReadableStream): Promise<void> {
    const filePath = this.getFilePath(key);
    const dirPath = path.dirname(filePath);
    
    // 디렉토리 생성
    await fs.mkdir(dirPath, { recursive: true });
    
    if (Buffer.isBuffer(data)) {
      // Buffer 데이터 직접 저장
      await fs.writeFile(filePath, data);
    } else {
      // 스트림 데이터 파이프라인으로 저장
      const writeStream = createWriteStream(filePath);
      await pipeline(data, writeStream);
    }
  }

  /**
   * 파일 다운로드 (Buffer로) - 내부 구현
   */
  private async download(key: string): Promise<Buffer> {
    const filePath = this.getFilePath(key);
    
    try {
      return await fs.readFile(filePath);
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        throw new Error(`File not found: ${key}`);
      }
      throw error;
    }
  }

  /**
   * 파일 다운로드 (스트림으로)
   */
  downloadStream(key: string): NodeJS.ReadableStream {
    const filePath = this.getFilePath(key);
    return createReadStream(filePath);
  }

  /**
   * 파일 존재 여부 확인
   */
  async exists(key: string): Promise<boolean> {
    const filePath = this.getFilePath(key);
    
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 파일 삭제
   */
  async delete(key: string): Promise<void> {
    const filePath = this.getFilePath(key);
    
    try {
      await fs.unlink(filePath);
      
      // 빈 디렉토리 정리
      await this.cleanupEmptyDirectories(path.dirname(filePath));
    } catch (error) {
      if ((error as any).code !== 'ENOENT') {
        throw error;
      }
      // 파일이 없으면 무시
    }
  }

  /**
   * 파일 크기 조회
   */
  async size(key: string): Promise<number> {
    const filePath = this.getFilePath(key);
    
    try {
      const stats = await fs.stat(filePath);
      return stats.size;
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        throw new Error(`File not found: ${key}`);
      }
      throw error;
    }
  }

  /**
   * 파일 URL 생성 - 내부 구현
   * 로컬 서빙을 위한 URL (Express static middleware 사용 가정)
   */
  private url(key: string): string {
    const dir1 = key.substring(0, 2);
    const dir2 = key.substring(2, 4);
    return `${this.baseUrl}/${dir1}/${dir2}/${key}`;
  }

  /**
   * 서명된 URL 생성 (로컬 저장소에서는 일반 URL과 동일)
   */
  signedUrl(key: string, expiresIn?: number): string {
    // 로컬 저장소에서는 서명된 URL을 지원하지 않으므로 일반 URL 반환
    // 실제 구현에서는 JWT 토큰 등을 사용하여 임시 접근 토큰 생성 가능
    return this.url(key);
  }

  /**
   * 빈 디렉토리 정리
   */
  private async cleanupEmptyDirectories(dirPath: string): Promise<void> {
    try {
      // 루트 경로까지는 삭제하지 않음
      if (dirPath === this.rootPath || !dirPath.startsWith(this.rootPath)) {
        return;
      }

      const entries = await fs.readdir(dirPath);
      if (entries.length === 0) {
        await fs.rmdir(dirPath);
        // 상위 디렉토리도 재귀적으로 확인
        await this.cleanupEmptyDirectories(path.dirname(dirPath));
      }
    } catch {
      // 에러 무시 (다른 프로세스에서 사용 중일 수 있음)
    }
  }

  /**
   * 저장소 설정 정보 조회
   */
  getConfig(): { rootPath: string; baseUrl: string } {
    return {
      rootPath: this.rootPath,
      baseUrl: this.baseUrl
    };
  }

  /**
   * 저장소 통계 조회 (파일 개수, 전체 크기 등)
   */
  async getStats(): Promise<{ fileCount: number; totalSize: number }> {
    let fileCount = 0;
    let totalSize = 0;

    const walkDirectory = async (dirPath: string): Promise<void> => {
      try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dirPath, entry.name);
          
          if (entry.isDirectory()) {
            await walkDirectory(fullPath);
          } else if (entry.isFile()) {
            fileCount++;
            const stats = await fs.stat(fullPath);
            totalSize += stats.size;
          }
        }
      } catch {
        // 디렉토리 접근 오류 무시
      }
    };

    await walkDirectory(this.rootPath);
    
    return { fileCount, totalSize };
  }

  /**
   * 저장소 정리 (사용되지 않는 파일 삭제 등)
   * 실제 구현에서는 Repository와 연동하여 참조되지 않는 파일 삭제
   */
  async cleanup(validKeys?: string[]): Promise<{ deletedCount: number; freedBytes: number }> {
    let deletedCount = 0;
    let freedBytes = 0;

    if (!validKeys) {
      // validKeys가 없으면 정리하지 않음 (안전을 위해)
      return { deletedCount, freedBytes };
    }

    const validKeySet = new Set(validKeys);

    const walkDirectory = async (dirPath: string): Promise<void> => {
      try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dirPath, entry.name);
          
          if (entry.isDirectory()) {
            await walkDirectory(fullPath);
          } else if (entry.isFile()) {
            // 파일명이 키와 일치하는지 확인
            const key = entry.name;
            if (!validKeySet.has(key)) {
              try {
                const stats = await fs.stat(fullPath);
                await fs.unlink(fullPath);
                deletedCount++;
                freedBytes += stats.size;
              } catch {
                // 삭제 오류 무시
              }
            }
          }
        }
      } catch {
        // 디렉토리 접근 오류 무시
      }
    };

    await walkDirectory(this.rootPath);
    
    return { deletedCount, freedBytes };
  }
}
