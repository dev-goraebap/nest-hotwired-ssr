import { IAttachment } from '../interfaces/attachment.interface';
import { randomUUID } from 'crypto';

/**
 * Attachment Model 클래스
 *
 * IAttachment 인터페이스를 구현하는 구체적인 클래스
 * 파일과 모델 간의 관계를 나타내며, 비즈니스 로직을 포함
 */
export class AttachmentModel implements IAttachment {
  id: string;
  name: string;
  recordType: string;
  recordId: string;
  blobId: string;
  attachmentType: 'single' | 'multiple';
  createdAt: Date;

  constructor(data: Partial<IAttachment>) {
    this.id = data.id || randomUUID();
    this.name = data.name || 'default';
    this.recordType = data.recordType || '';
    this.recordId = data.recordId || '';
    this.blobId = data.blobId || '';
    this.attachmentType = data.attachmentType || 'single';
    this.createdAt = data.createdAt || new Date();
  }

  /**
   * 새로운 Attachment 인스턴스 생성
   * @param recordType 연결할 모델명 (User, Post 등)
   * @param recordId 연결할 레코드 ID
   * @param blobId 파일 정보 ID
   * @param name attachment 이름 (avatar, documents 등)
   * @returns AttachmentModel 인스턴스
   */
  static create(
    recordType: string,
    recordId: string,
    blobId: string,
    name: string = 'default',
  ): AttachmentModel {
    return new AttachmentModel({
      recordType,
      recordId,
      blobId,
      name,
    });
  }

  /**
   * 특정 레코드의 소유인지 확인
   * @param recordType 모델명
   * @param recordId 레코드 ID
   * @returns 소유 여부
   */
  isOwnedBy(recordType: string, recordId: string): boolean {
    return this.recordType === recordType && this.recordId === recordId;
  }

  /**
   * has_one_attached 패턴인지 확인
   * @returns 단일 첨부파일 여부
   */
  isSingleAttachment(): boolean {
    return this.attachmentType === 'single';
  }

  /**
   * has_many_attached 패턴인지 확인
   * @returns 복수 첨부파일 여부
   */
  isMultipleAttachment(): boolean {
    return this.attachmentType === 'multiple';
  }

  /**
   * 생성된 지 얼마나 되었는지 계산
   * @returns 밀리초 단위 경과 시간
   */
  getAge(): number {
    return Date.now() - this.createdAt.getTime();
  }

  /**
   * Plain object로 변환
   * @returns IAttachment 형태의 객체
   */
  toJSON(): IAttachment {
    return {
      id: this.id,
      name: this.name,
      recordType: this.recordType,
      recordId: this.recordId,
      blobId: this.blobId,
      attachmentType: this.attachmentType,
      createdAt: this.createdAt,
    };
  }

  /**
   * 데이터 검증
   * @throws Error 필수 필드 누락 시
   */
  validate(): void {
    if (!this.recordType) throw new Error('recordType is required');
    if (!this.recordId) throw new Error('recordId is required');
    if (!this.blobId) throw new Error('blobId is required');
    if (!this.name) throw new Error('name is required');
  }
}
