import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AttachmentEntity } from './attachment.entity';

@Entity({ name: 'blobs' })
export class BlobEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  readonly id: number;

  @Column()
  readonly key: string; // 저장된 파일이름

  @Column()
  readonly filename: string; // 원본 파일 이름

  @Column({ name: 'content_type' })
  readonly contentType: string; // mimetype

  @Column({ name: 'service_name' })
  readonly serviceName: string; // 파일저장방식: local, gcs, s3 ...

  @Column({ name: 'byte_size' })
  readonly byteSize: number; // 파일 바이트 크기

  @Column()
  readonly checksum: string; // md5로 채크한 파일의 고유한 버퍼스트링

  @CreateDateColumn()
  readonly createdAt: Date;

  @OneToMany(() => AttachmentEntity, (e) => e.blob)
  readonly attachments: AttachmentEntity[];

  @Column({
    name: 'metadata',
    type: 'text',
    default: '{}',
    transformer: {
      to: (value: Record<string, any>) => JSON.stringify(value),
      from: (value: string) => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return JSON.parse(value || '{}');
        } catch {
          return {};
        }
      },
    },
  })
  readonly metadata: Record<string, any>;

  getFilePath(): string {
    return `${this.key.substring(0, 2)}/${this.key.substring(2, 4)}/${this.key}`;
  }

  isImage(): boolean {
    return this.contentType.startsWith('image/');
  }

  isVideo(): boolean {
    return this.contentType.startsWith('video/');
  }

  isAudio(): boolean {
    return this.contentType.startsWith('audio/');
  }

  isText(): boolean {
    return (
      this.contentType.startsWith('text/') ||
      this.contentType === 'application/json' ||
      this.contentType === 'application/xml'
    );
  }

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

  getExtension(): string {
    const parts = this.filename.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  }
}
