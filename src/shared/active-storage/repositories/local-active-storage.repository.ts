import { ActiveStorageHelper } from '../helpers/active-storage.helper';
import { IActiveStorageRepository } from '../interfaces/active-storage.repository';
import { IAttachmentModel } from '../interfaces/attachment.model';
import { IBlobModel } from '../interfaces/blob.model';
import { BaseAttachmentModel } from '../models/base-attachment.model';
import { BaseBlobModel } from '../models/base-blob.model';

export class LocalActiveStorageRepository implements IActiveStorageRepository {
  private attachments: IAttachmentModel[] = [];
  private blobs: IBlobModel[] = [];

  findAttachmentByRecordType(
    recordType: string,
    name: string | undefined,
  ): Promise<IAttachmentModel[]> {
    let results = this.attachments.filter((x) => x.recordType === recordType);

    if (name) {
      results = results.filter((x) => x.name === name);
    }
    return Promise.resolve(results);
  }

  createAttachment(
    name: string,
    recordType: string,
    recordId: string,
    blob: IBlobModel,
  ): IAttachmentModel {
    return new BaseAttachmentModel({
      name,
      recordType,
      recordId,
      blob,
    });
  }

  saveAttachment(attachment: IAttachmentModel): Promise<IAttachmentModel> {
    this.attachments.push(attachment);
    console.log('======= Save Attachment Model =======');
    console.log(attachment);
    return Promise.resolve(attachment);
  }

  deleteAttachmentsByRecordTypeAndName(
    recordType: string,
    name: string,
  ): Promise<void> {
    this.attachments = this.attachments.filter(
      (x) => x.recordType !== recordType && x.name !== name,
    );
    console.log('======= Filtered Attachment Models[] =======');
    console.log(this.attachments);
    return Promise.resolve();
  }

  findBlobByChecksum(checksum: string): Promise<IBlobModel | null> {
    const result = this.blobs.find((x) => x.checksum === checksum) ?? null;
    console.log('======= Find Blob Model =======');
    console.log(result);
    return Promise.resolve(result);
  }

  createBlob(
    buffer: Buffer,
    filename: string,
    contentType: string,
    serviceName: string,
  ): IBlobModel {
    const checksum = ActiveStorageHelper.getChecksum(buffer);
    const key = ActiveStorageHelper.generateKey();
    return new BaseBlobModel({
      key,
      checksum,
      filename,
      contentType,
      byteSize: buffer.length,
      serviceName,
    });
  }

  saveBlob(blob: IBlobModel): Promise<IBlobModel> {
    this.blobs.push(blob);
    console.log('======= Save Blob Model =======');
    console.log(blob);
    return Promise.resolve(blob);
  }
}
