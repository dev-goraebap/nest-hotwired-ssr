import { Injectable } from '@nestjs/common';

import { AttachmentData } from '../interfaces/attachment.types';
import { BlobData } from '../interfaces/blob.types';
import { IAttachmentRepository } from '../interfaces/repository.interface';

/**
 * 메모리 기반 Attachment Repository 구현체
 * 
 * 개발 및 테스트용 임시 구현체
 * 실제 운영 환경에서는 SQLite, TypeORM 등을 사용하는 구현체를 사용
 */
@Injectable()
export class MemoryAttachmentRepository implements IAttachmentRepository {
  private blobs: Map<string, BlobData> = new Map();
  private attachments: Map<string, AttachmentData> = new Map();

  constructor() {
    console.log('MemoryAttachmentRepository initialized - 메모리 기반 저장소 (개발용)');
  }

  /**
   * Blob 저장
   */
  async saveBlob(blob: BlobData): Promise<BlobData> {
    this.blobs.set(blob.id, blob);
    return blob;
  }

  /**
   * Blob 조회 (ID로)
   */
  async findBlobById(id: string): Promise<BlobData | null> {
    return this.blobs.get(id) || null;
  }

  /**
   * Blob 조회 (체크섬으로)
   */
  async findBlobByChecksum(checksum: string): Promise<BlobData | null> {
    for (const blob of this.blobs.values()) {
      if (blob.checksum === checksum) {
        return blob;
      }
    }
    return null;
  }

  /**
   * Blob 삭제
   */
  async deleteBlob(id: string): Promise<void> {
    this.blobs.delete(id);
  }

  /**
   * Attachment 저장
   */
  async saveAttachment(attachment: AttachmentData): Promise<AttachmentData> {
    this.attachments.set(attachment.id, attachment);
    return attachment;
  }

  /**
   * Attachment 조회 (레코드별)
   */
  async findAttachmentsByRecord(recordType: string, recordId: string, name?: string): Promise<AttachmentData[]> {
    const results: AttachmentData[] = [];
    
    for (const attachment of this.attachments.values()) {
      if (attachment.recordType === recordType && 
          attachment.recordId === recordId &&
          (!name || attachment.name === name)) {
        results.push(attachment);
      }
    }
    
    return results.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  /**
   * Attachment 조회 (ID로)
   */
  async findAttachmentById(id: string): Promise<AttachmentData | null> {
    return this.attachments.get(id) || null;
  }

  /**
   * Attachment 삭제
   */
  async deleteAttachment(id: string): Promise<void> {
    this.attachments.delete(id);
  }

  /**
   * Attachment와 연결된 Blob 조회
   */
  async findAttachmentWithBlob(attachmentId: string): Promise<{attachment: AttachmentData, blob: BlobData} | null> {
    const attachment = this.attachments.get(attachmentId);
    if (!attachment) {
      return null;
    }

    const blob = this.blobs.get(attachment.blobId);
    if (!blob) {
      return null;
    }

    return { attachment, blob };
  }

  /**
   * 특정 레코드의 모든 Attachment 삭제
   */
  async deleteAttachmentsByRecord(recordType: string, recordId: string, name?: string): Promise<number> {
    let deletedCount = 0;
    const toDelete: string[] = [];
    
    for (const [id, attachment] of this.attachments.entries()) {
      if (attachment.recordType === recordType && 
          attachment.recordId === recordId &&
          (!name || attachment.name === name)) {
        toDelete.push(id);
      }
    }
    
    for (const id of toDelete) {
      this.attachments.delete(id);
      deletedCount++;
    }
    
    return deletedCount;
  }

  /**
   * 사용되지 않는 Blob 삭제
   */
  async deleteUnusedBlobs(): Promise<number> {
    const usedBlobIds = new Set<string>();
    
    // 사용 중인 Blob ID 수집
    for (const attachment of this.attachments.values()) {
      usedBlobIds.add(attachment.blobId);
    }
    
    // 사용되지 않는 Blob 삭제
    let deletedCount = 0;
    for (const [blobId, blob] of this.blobs.entries()) {
      if (!usedBlobIds.has(blobId)) {
        this.blobs.delete(blobId);
        deletedCount++;
      }
    }
    
    return deletedCount;
  }

  /**
   * 저장소 상태 조회 (디버깅용)
   */
  getStats(): { blobCount: number; attachmentCount: number } {
    return {
      blobCount: this.blobs.size,
      attachmentCount: this.attachments.size
    };
  }

  /**
   * 저장소 초기화
   */
  clear(): void {
    this.blobs.clear();
    this.attachments.clear();
  }
}
