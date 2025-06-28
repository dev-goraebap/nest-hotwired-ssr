import * as crypto from 'crypto';
import { BaseEntity, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AttachmentEntity } from './attachment.entity';

/**
 * Blob Entity (Active Record Pattern)
 * 
 * 실제 파일의 메타데이터를 저장하는 TypeORM 엔티티
 * Active Record 패턴으로 모델 자체에서 DB 작업 수행
 */
@Entity('blobs')
export class BlobEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 64 })
  key: string;

  @Column()
  filename: string;

  @Column({ name: 'content_type' })
  contentType: string;

  @Column('text', { nullable: true })
  private _metadata: string;

  // metadata getter/setter for JSON handling
  get metadata(): Record<string, any> {
    if (!this._metadata) return {};
    try {
      return JSON.parse(this._metadata);
    } catch {
      return {};
    }
  }

  set metadata(value: Record<string, any>) {
    this._metadata = JSON.stringify(value);
  }

  @Column({ name: 'service_name', default: 'local' })
  serviceName: string;

  @Column({ name: 'byte_size', type: 'bigint' })
  byteSize: number;

  @Column({ length: 32 })
  checksum: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relationships
  @OneToMany(() => AttachmentEntity, attachment => attachment.blob)
  attachments: AttachmentEntity[];

  /**
   * 파일 버퍼로부터 새로운 Blob 엔티티 생성 및 저장
   */
  static async createFromFile(
    file: Buffer,
    filename: string,
    contentType: string,
    serviceName: string = 'local'
  ): Promise<BlobEntity> {
    const checksum = crypto.createHash('md5').update(file).digest('hex');
    const key = BlobEntity.generateKey();
    
    const blob = new BlobEntity();
    blob.key = key;
    blob.filename = filename;
    blob.contentType = contentType;
    blob.serviceName = serviceName;
    blob.byteSize = file.length;
    blob.checksum = checksum;
    blob.metadata = { analyzed: false };

    return await blob.save();
  }

  /**
   * 체크섬으로 기존 Blob 찾기
   */
  static async findByChecksum(checksum: string): Promise<BlobEntity | null> {
    return await BlobEntity.findOne({ where: { checksum } });
  }

  /**
   * Rails 스타일 스토리지 키 생성
   */
  private static generateKey(): string {
    return crypto.randomBytes(16).toString('hex') + crypto.randomBytes(2).toString('hex');
  }

  /**
   * Rails 스타일 파일 경로 생성
   */
  getFilePath(): string {
    return `${this.key.substring(0, 2)}/${this.key.substring(2, 4)}/${this.key}`;
  }

  /**
   * 이미지 파일인지 확인
   */
  isImage(): boolean {
    return this.contentType.startsWith('image/');
  }

  /**
   * 비디오 파일인지 확인
   */
  isVideo(): boolean {
    return this.contentType.startsWith('video/');
  }

  /**
   * 오디오 파일인지 확인
   */
  isAudio(): boolean {
    return this.contentType.startsWith('audio/');
  }

  /**
   * 텍스트 파일인지 확인
   */
  isText(): boolean {
    return this.contentType.startsWith('text/') || 
          this.contentType === 'application/json' ||
          this.contentType === 'application/xml';
  }

  /**
   * 파일 크기를 사람이 읽기 쉬운 형태로 변환
   */
  getHumanFileSize(): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = Number(this.byteSize);
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  /**
   * 파일 확장자 추출
   */
  getExtension(): string {
    const parts = this.filename.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  }

  /**
   * 체크섬 검증
   */
  verifyChecksum(fileBuffer: Buffer): boolean {
    const calculatedChecksum = crypto.createHash('md5').update(fileBuffer).digest('hex');
    return this.checksum === calculatedChecksum;
  }

  /**
   * 메타데이터에 분석 정보 추가 및 저장
   */
  async addAnalysisMetadata(analysisData: Record<string, any>): Promise<void> {
    this.metadata = {
      ...this.metadata,
      ...analysisData,
      analyzed: true,
      analyzedAt: new Date().toISOString()
    };
    await this.save();
  }

  /**
   * 분석 완료 여부 확인
   */
  isAnalyzed(): boolean {
    return this.metadata.analyzed === true;
  }

  /**
   * 사용되지 않는 Blob들 삭제 (정리 작업)
   */
  static async deleteUnused(): Promise<number> {
    const unusedBlobs = await BlobEntity.createQueryBuilder('blob')
      .leftJoin('blob.attachments', 'attachment')
      .where('attachment.id IS NULL')
      .getMany();

    if (unusedBlobs.length > 0) {
      await BlobEntity.remove(unusedBlobs);
    }

    return unusedBlobs.length;
  }
}
