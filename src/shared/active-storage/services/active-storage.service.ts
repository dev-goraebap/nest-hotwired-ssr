import { Inject, Injectable, Logger } from '@nestjs/common';

import { ActiveStorageHelper } from '../helpers/active-storage.helper';
import {
  ACTIVE_STORAGE_REPOSITORY,
  IActiveStorageRepository,
} from '../interfaces/active-storage.repository';
import { IAttachmentModel } from '../interfaces/attachment.model';
import {
  IStorageAdapter,
  STORAGE_ADAPTER,
} from '../interfaces/storage.adapter';

/**
 * 파일을 저장하고 관리하는 서비스
 *
 * @description
 * - 연결된 저장소 어뎁터, 모델 리파지토리에 따라 유연하게 사용가능
 *    - 기본값은 local에 파일저장과 메모리에 모델 정보를 저장합니다.
 *    - typeorm에 연결되는 것을 강하게 기대하고 설계하였습니다.
 */
@Injectable()
export class ActiveStorageService {
  private readonly logger = new Logger(ActiveStorageService.name);

  constructor(
    @Inject(ACTIVE_STORAGE_REPOSITORY)
    private readonly activeStorageRepository: IActiveStorageRepository,
    @Inject(STORAGE_ADAPTER) private readonly storageAdapter: IStorageAdapter,
  ) {}

  /**
   * 특정 도메인의 첨부파일들 조회
   * @description
   * - name(파일유형이름) 을 추가로 첨부 시 해당 유형으로 한번 더 필터링
   */
  async findAttachments(
    recordType: string,
    name?: string,
  ): Promise<IAttachmentModel[]> {
    return await this.activeStorageRepository.findAttachmentByRecordType(
      recordType,
      name,
    );
  }

  /**
   * 파일 저장 프로세스
   */
  async attach(
    file: Express.Multer.File,
    recordType: string,
    recordId: string,
    name: string = 'file',
    isMultiple: boolean = false,
  ) {
    // 1. single 타입인 경우 기존 첨부파일 제거
    if (!isMultiple) {
      console.log('single 타입: 기존에 연결된 첨부파일 제거');
      await this.activeStorageRepository.deleteAttachmentsByRecordTypeAndName(
        recordType,
        name,
      );
    }

    // 2. 중복 파일 체크 (같은 checksum을 가진 blob이 있는지)
    const checksum = ActiveStorageHelper.getChecksum(file.buffer);
    let blob = await this.activeStorageRepository.findBlobByChecksum(checksum);

    if (!blob) {
      // 새 파일인 경우 저장
      const serviceName = this.storageAdapter.getServiceName();
      blob = this.activeStorageRepository.createBlob(
        file.buffer,
        file.originalname,
        file.mimetype,
        serviceName,
      );
      await this.activeStorageRepository.saveBlob(blob);

      // 실제 파일 저장
      await this.storageAdapter.store(blob.key, file.buffer);
    }

    // 3. Attachment 생성 및 저장
    const attachment = this.activeStorageRepository.createAttachment(
      name,
      recordType,
      recordId,
      blob,
    );
    await this.activeStorageRepository.saveAttachment(attachment);

    return attachment;
  }
}
