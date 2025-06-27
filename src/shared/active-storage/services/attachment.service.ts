import { Inject, Injectable } from '@nestjs/common';

import { IAttachment } from '../interfaces/attachment.interface';
import { IBlob } from '../interfaces/blob.interface';
import { IAttachmentRepository } from '../interfaces/repository.interface';
import { IStorageAdapter } from '../interfaces/storage-adapter.interface';
import { AttachmentModel } from '../models/attachment.model';
import { BlobModel } from '../models/blob.model';

/**
 * Attachment Service 클래스
 * 
 * Active Storage의 핵심 비즈니스 로직을 담당하는 서비스
 * 파일 업로드, 첨부, 조회, 삭제 등의 주요 기능을 제공
 * 
 * @description
 * Rails Active Storage의 API와 유사한 인터페이스를 제공합니다.
 * Repository와 Storage Adapter를 통해 데이터 저장과 파일 저장을 분리합니다.
 */
@Injectable()
export class AttachmentService {
  constructor(
    @Inject('IAttachmentRepository')
    private readonly repository: IAttachmentRepository,
    @Inject('IStorageAdapter') 
    private readonly storageAdapter: IStorageAdapter
  ) {}

  /**
   * 파일을 업로드하고 모델에 첨부 (Rails의 attach 메서드와 유사)
   * @param recordType 연결할 모델명 (User, Post 등)
   * @param recordId 연결할 레코드 ID
   * @param file 업로드할 파일
   * @param name attachment 이름 (avatar, documents 등)
   * @param attachmentType 첨부파일 타입 ('single' | 'multiple')
   * @returns 생성된 Attachment
   */
  async attach(
    recordType: string,
    recordId: string,
    file: Express.Multer.File,
    name: string = 'default',
    attachmentType: 'single' | 'multiple' = 'single'
  ): Promise<AttachmentModel> {
    // 1. single 타입인 경우 기존 첨부파일 제거
    if (attachmentType === 'single') {
      await this.detachByName(recordType, recordId, name);
    }

    // 2. 중복 파일 체크 (같은 checksum을 가진 blob이 있는지)
    const blob = BlobModel.createFromFile(
      file.buffer,
      file.originalname,
      file.mimetype,
      this.storageAdapter.getServiceName()
    );

    const existingBlob = await this.repository.findBlobByChecksum(blob.checksum);
    let savedBlob: IBlob;

    if (existingBlob) {
      // 중복 파일인 경우 기존 blob 재사용
      savedBlob = existingBlob;
    } else {
      // 새 파일인 경우 저장
      await this.storageAdapter.store(blob.key, file.buffer);
      savedBlob = await this.repository.saveBlob(blob.toJSON());
    }

    // 3. Attachment 생성 및 저장
    const attachment = AttachmentModel.create(
      recordType,
      recordId,
      savedBlob.id,
      name
    );
    attachment.attachmentType = attachmentType;

    const savedAttachment = await this.repository.saveAttachment(attachment.toJSON());
    return new AttachmentModel(savedAttachment);
  }

  /**
   * 여러 파일을 한번에 첨부 (Rails의 attach 메서드 - 배열 버전)
   * @param recordType 연결할 모델명
   * @param recordId 연결할 레코드 ID  
   * @param files 업로드할 파일들
   * @param name attachment 이름
   * @returns 생성된 Attachment들
   */
  async attachMany(
    recordType: string,
    recordId: string,
    files: Express.Multer.File[],
    name: string = 'documents'
  ): Promise<AttachmentModel[]> {
    const attachments: AttachmentModel[] = [];

    for (const file of files) {
      const attachment = await this.attach(
        recordType,
        recordId,
        file,
        name,
        'multiple'
      );
      attachments.push(attachment);
    }

    return attachments;
  }

  /**
   * 특정 레코드의 첨부파일들 조회 (Rails의 user.avatar, user.documents와 유사)
   * @param recordType 모델명
   * @param recordId 레코드 ID
   * @param name attachment 이름 (선택사항)
   * @returns 첨부파일들과 blob 정보
   */
  async findAttachments(
    recordType: string,
    recordId: string,
    name?: string
  ): Promise<Array<{ attachment: IAttachment; blob: IBlob }>> {
    const attachments = await this.repository.findAttachmentsByRecord(
      recordType,
      recordId,
      name
    );

    const results: Array<{ attachment: IAttachment; blob: IBlob }> = [];
    for (const attachment of attachments) {
      const blob = await this.repository.findBlobById(attachment.blobId);
      if (blob) {
        results.push({ attachment, blob });
      }
    }

    return results;
  }

  /**
   * has_one_attached 패턴으로 단일 첨부파일 조회
   * @param recordType 모델명
   * @param recordId 레코드 ID
   * @param name attachment 이름
   * @returns 첨부파일과 blob 정보 (없으면 null)
   */
  async findSingleAttachment(
    recordType: string,
    recordId: string,
    name: string
  ): Promise<{ attachment: IAttachment; blob: IBlob } | null> {
    const results = await this.findAttachments(recordType, recordId, name);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * has_many_attached 패턴으로 복수 첨부파일들 조회
   * @param recordType 모델명
   * @param recordId 레코드 ID  
   * @param name attachment 이름
   * @returns 첨부파일들과 blob 정보들
   */
  async findMultipleAttachments(
    recordType: string,
    recordId: string,
    name: string
  ): Promise<Array<{ attachment: IAttachment; blob: IBlob }>> {
    return this.findAttachments(recordType, recordId, name);
  }

  /**
   * 첨부파일의 공개 URL 생성
   * @param attachmentId attachment ID
   * @param options URL 생성 옵션
   * @returns 파일 접근 URL
   */
  async getFileUrl(
    attachmentId: string,
    options?: Record<string, any>
  ): Promise<string> {
    const result = await this.repository.findAttachmentWithBlob(attachmentId);
    if (!result) {
      throw new Error('Attachment not found');
    }

    const url = this.storageAdapter.getUrl(result.blob.key, options);
    return typeof url === 'string' ? url : await url;
  }

  /**
   * 첨부파일 제거 (Rails의 detach 메서드와 유사)
   * @param attachmentId attachment ID
   * @param deleteFile 실제 파일도 삭제할지 여부 (기본값: false)
   */
  async detach(attachmentId: string, deleteFile: boolean = false): Promise<void> {
    const result = await this.repository.findAttachmentWithBlob(attachmentId);
    if (!result) {
      throw new Error('Attachment not found');
    }

    // Attachment 삭제
    await this.repository.deleteAttachment(attachmentId);

    // 실제 파일 삭제 옵션이 켜져있고, 다른 attachment가 같은 blob을 참조하지 않는 경우
    if (deleteFile) {
      const otherAttachments = await this.repository.findAttachmentsByRecord('', '', '');
      const isReferencedByOthers = otherAttachments.some(
        att => att.blobId === result.blob.id && att.id !== attachmentId
      );

      if (!isReferencedByOthers) {
        await this.storageAdapter.delete(result.blob.key);
        await this.repository.deleteBlob(result.blob.id);
      }
    }
  }

  /**
   * 특정 이름의 모든 첨부파일 제거
   * @param recordType 모델명
   * @param recordId 레코드 ID
   * @param name attachment 이름
   * @param deleteFiles 실제 파일도 삭제할지 여부
   */
  async detachByName(
    recordType: string,
    recordId: string,
    name: string,
    deleteFiles: boolean = false
  ): Promise<void> {
    const attachments = await this.repository.findAttachmentsByRecord(
      recordType,
      recordId,
      name
    );

    for (const attachment of attachments) {
      await this.detach(attachment.id, deleteFiles);
    }
  }

  /**
   * 파일 다운로드
   * @param attachmentId attachment ID
   * @returns 파일 버퍼
   */
  async downloadFile(attachmentId: string): Promise<Buffer> {
    const result = await this.repository.findAttachmentWithBlob(attachmentId);
    if (!result) {
      throw new Error('Attachment not found');
    }

    return await this.storageAdapter.retrieve(result.blob.key);
  }

  /**
   * 첨부파일이 존재하는지 확인
   * @param recordType 모델명
   * @param recordId 레코드 ID
   * @param name attachment 이름
   * @returns 존재 여부
   */
  async hasAttached(
    recordType: string,
    recordId: string,
    name: string
  ): Promise<boolean> {
    const attachments = await this.repository.findAttachmentsByRecord(
      recordType,
      recordId,
      name
    );
    return attachments.length > 0;
  }
}
