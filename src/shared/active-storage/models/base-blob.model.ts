import { randomUUID } from 'crypto';
import { BlobData, IBlobModel } from '../interfaces/blob.model';

export class BaseBlobModel implements IBlobModel {
  readonly id: string;
  readonly key: string;
  readonly filename: string;
  readonly contentType: string;
  readonly serviceName: string;
  readonly byteSize: number;
  readonly checksum: string;
  readonly createdAt: Date;

  private _metadata: any;
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

  constructor(
    prop: Pick<
      BlobData,
      | 'key'
      | 'checksum'
      | 'filename'
      | 'contentType'
      | 'byteSize'
      | 'serviceName'
    >,
  ) {
    this.id = randomUUID();
    this.key = prop.key;
    this.checksum = prop.checksum;
    this.filename = prop.filename;
    this.contentType = prop.contentType;
    this.byteSize = prop.byteSize;
    this.serviceName = prop.serviceName;
    this.createdAt = new Date();
    this.metadata = { analyzed: false };
  }

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
