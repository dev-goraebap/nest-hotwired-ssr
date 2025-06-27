import { IBlob } from '../interfaces/blob.interface';
import { randomUUID } from 'crypto';
import * as crypto from 'crypto';

/**
 * Blob Model 클래스
 *
 * IBlob 인터페이스를 구현하는 구체적인 클래스
 * 실제 파일의 메타데이터를 나타내며, 파일 관련 비즈니스 로직을 포함
 */
export class BlobModel implements IBlob {
  id: string;
  key: string;
  filename: string;
  contentType: string;
  metadata: Record<string, any>;
  serviceName: string;
  byteSize: number;
  checksum: string;
  createdAt: Date;

  constructor(data: Partial<IBlob>) {
    this.id = data.id || randomUUID();
    this.key = data.key || this.generateKey();
    this.filename = data.filename || 'untitled';
    this.contentType = data.contentType || 'application/octet-stream';
    this.metadata = data.metadata || {};
    this.serviceName = data.serviceName || 'local';
    this.byteSize = data.byteSize || 0;
    this.checksum = data.checksum || '';
    this.createdAt = data.createdAt || new Date();
  }

  /**
   * 파일 버퍼로부터 새로운 Blob 인스턴스 생성
   * @param file 파일 버퍼
   * @param filename 원본 파일명
   * @param contentType MIME 타입
   * @param serviceName 스토리지 서비스명
   * @returns BlobModel 인스턴스
   */
  static createFromFile(
    file: Buffer,
    filename: string,
    contentType: string,
    serviceName: string = 'local'
  ): BlobModel {
    const checksum = crypto.createHash('md5').update(file).digest('hex');
    
    return new BlobModel({
      filename,
      contentType,
      serviceName,
      byteSize: file.length,
      checksum,
      metadata: {
        analyzed: false
      }
    });
  }

  /**
   * Rails 스타일 스토리지 키 생성
   * @returns 생성된 키 (28자 랜덤 문자열)
   */
  private generateKey(): string {
    return randomUUID().replace(/-/g, '') + randomUUID().replace(/-/g, '').substring(0, 4);
  }

  /**
   * Rails 스타일 파일 경로 생성
   * @returns 파일 경로 (ab/c1/abc123def456...)
   */
  getFilePath(): string {
    return `${this.key.substring(0, 2)}/${this.key.substring(2, 4)}/${this.key}`;
  }

  /**
   * 이미지 파일인지 확인
   * @returns 이미지 여부
   */
  isImage(): boolean {
    return this.contentType.startsWith('image/');
  }

  /**
   * 비디오 파일인지 확인
   * @returns 비디오 여부
   */
  isVideo(): boolean {
    return this.contentType.startsWith('video/');
  }

  /**
   * 오디오 파일인지 확인
   * @returns 오디오 여부
   */
  isAudio(): boolean {
    return this.contentType.startsWith('audio/');
  }

  /**
   * 텍스트 파일인지 확인
   * @returns 텍스트 여부
   */
  isText(): boolean {
    return this.contentType.startsWith('text/') || 
          this.contentType === 'application/json' ||
          this.contentType === 'application/xml';
  }

  /**
   * 파일 크기를 사람이 읽기 쉬운 형태로 변환
   * @returns 포맷된 파일 크기 (예: "1.2 MB")
   */
  getHumanFileSize(): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = this.byteSize;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  /**
   * 파일 확장자 추출
   * @returns 파일 확장자 (예: "jpg", "pdf")
   */
  getExtension(): string {
    const parts = this.filename.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  }

  /**
   * 체크섬 검증
   * @param fileBuffer 검증할 파일 버퍼
   * @returns 체크섬 일치 여부
   */
  verifyChecksum(fileBuffer: Buffer): boolean {
    const calculatedChecksum = crypto.createHash('md5').update(fileBuffer).digest('hex');
    return this.checksum === calculatedChecksum;
  }

  /**
   * 메타데이터에 분석 정보 추가
   * @param analysisData 분석 결과 데이터
   */
  addAnalysisMetadata(analysisData: Record<string, any>): void {
    this.metadata = {
      ...this.metadata,
      ...analysisData,
      analyzed: true,
      analyzedAt: new Date().toISOString()
    };
  }

  /**
   * 분석 완료 여부 확인
   * @returns 분석 완료 여부
   */
  isAnalyzed(): boolean {
    return this.metadata.analyzed === true;
  }

  /**
   * Plain object로 변환
   * @returns IBlob 형태의 객체
   */
  toJSON(): IBlob {
    return {
      id: this.id,
      key: this.key,
      filename: this.filename,
      contentType: this.contentType,
      metadata: this.metadata,
      serviceName: this.serviceName,
      byteSize: this.byteSize,
      checksum: this.checksum,
      createdAt: this.createdAt
    };
  }

  /**
   * 데이터 검증
   * @throws Error 필수 필드 누락 시
   */
  validate(): void {
    if (!this.key) throw new Error('key is required');
    if (!this.filename) throw new Error('filename is required');
    if (!this.contentType) throw new Error('contentType is required');
    if (!this.serviceName) throw new Error('serviceName is required');
    if (this.byteSize < 0) throw new Error('byteSize must be non-negative');
    if (!this.checksum) throw new Error('checksum is required');
  }
}
