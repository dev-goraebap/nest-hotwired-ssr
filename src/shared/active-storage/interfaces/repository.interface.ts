import { AttachmentData } from './attachment.types';
import { BlobData } from './blob.types';

/**
 * Repository 인터페이스
 * 
 * Attachment와 Blob 데이터의 영속성을 담당하는 인터페이스
 * SQLite, TypeORM, 메모리 등 다양한 저장소 구현체에서 구현
 * 
 * @description
 * - 해당 모듈은 기본적으로 better-sqlite 라이브러리를 사용합니다.
 * - typeorm 등의 database를 사용하게 되면 인터페이스를 확장하여 사용할 수 있습니다.
 * 
 * @example
 * // 기본으로 사용하는 BetterSQLite 구현체
 * class BaseAttachmentRepository implements IAttachmentRepository { ... }
 * 
 * // TypeORM 구현체  
 * class TypeORMAttachmentRepository implements IAttachmentRepository { ... }
 */
export interface IAttachmentRepository {
  // Blob 관련 메서드
  saveBlob(blob: BlobData): Promise<BlobData>;
  findBlobById(id: string): Promise<BlobData | null>;
  findBlobByChecksum(checksum: string): Promise<BlobData | null>;
  deleteBlob(id: string): Promise<void>;

  // Attachment 관련 메서드  
  saveAttachment(attachment: AttachmentData): Promise<AttachmentData>;
  findAttachmentsByRecord(
    recordType: string, 
    recordId: string, 
    name?: string
  ): Promise<AttachmentData[]>;
  findAttachmentById(id: string): Promise<AttachmentData | null>;
  deleteAttachment(id: string): Promise<void>;

  // 관계 조회 메서드
  findAttachmentWithBlob(attachmentId: string): Promise<{
    attachment: AttachmentData;
    blob: BlobData;
  } | null>;
}
