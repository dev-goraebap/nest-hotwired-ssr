import { randomUUID } from 'crypto';
import {
  AttachmentData,
  IAttachmentModel,
} from '../interfaces/attachment.model';
import { IBlobModel } from '../interfaces/blob.model';

export class BaseAttachmentModel implements IAttachmentModel {
  readonly id: string;
  readonly name: string;
  readonly recordType: string;
  readonly recordId: string;
  readonly blobId: string;
  readonly createdAt: Date;
  readonly blob: IBlobModel;

  constructor(
    prop: Pick<AttachmentData, 'name' | 'recordType' | 'recordId' | 'blob'>,
  ) {
    this.id = randomUUID();
    this.name = prop.name;
    this.recordType = prop.recordType;
    this.recordId = prop.recordId;
    this.blob = prop.blob;
    this.blobId = prop.blob.id;
    this.createdAt = new Date();
  }
}
