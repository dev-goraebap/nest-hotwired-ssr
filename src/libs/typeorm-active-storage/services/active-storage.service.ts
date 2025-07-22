import { Inject, Injectable, Logger } from '@nestjs/common';

import { AttachmentEntity } from '../entities/attachment.entity';
import { BlobEntity } from '../entities/blob.entity';
import { STORAGE_PORT, StoragePort } from '../infra/ports/storage.port';
import { Utils } from '../utils';

@Injectable()
export class ActiveStorageService {
  private readonly logger = new Logger(ActiveStorageService.name);

  constructor(
    @Inject(STORAGE_PORT)
    private readonly storage: StoragePort,
  ) {}

  async findSingleAttachment(
    attachmentId: number,
  ): Promise<AttachmentEntity | null> {
    return await AttachmentEntity.findOne({
      where: { id: attachmentId },
      relations: { blob: true },
    });
  }

  async findAttachmentsByRecord(
    recordType: string,
    recordId: string,
    name?: string,
  ): Promise<AttachmentEntity[]> {
    const whereCondition: any = { recordType, recordId };
    if (name !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      whereCondition.name = name;
    }
    return await AttachmentEntity.find({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      where: whereCondition,
      relations: { blob: true },
    });
  }

  /**
   * 단일 파일을 특정 도메인 레코드에 첨부
   *
   * @param file 업로드된 파일 (Express.Multer.File)
   * @param recordType 도메인 타입 (예: 'User', 'Post', 'Comment')
   * @param recordId 도메인 레코드의 고유 ID
   * @param name 첨부파일 분류명 (예: 'avatar', 'thumbnail', 'document')
   * @param mode 첨부 모드 - 'replace(기본값)': 기존 파일 전부 제거 후 첨부, 'append': 추가 첨부
   * @returns 생성된 AttachmentEntity (blob 관계 포함)
   *
   * @description
   * 파일 첨부 프로세스:
   * 1. replace 모드시 기존 동일 분류 첨부파일 삭제
   * 2. 파일 내용 기반 중복 체크 (MD5 checksum)
   * 3. 중복 파일이면 기존 Blob 재사용, 새 파일이면 Blob 생성
   * 4. 스토리지에 실제 파일 저장 (새 파일인 경우만)
   * 5. Attachment 레코드 생성 및 저장
   */
  async attach(
    file: Express.Multer.File,
    recordType: string,
    recordId: string,
    name: string,
    mode: 'replace' | 'append' = 'replace',
  ): Promise<AttachmentEntity> {
    this.logger.log(
      `파일 첨부 시작: ${file.originalname} (${file.size} bytes) → ${recordType}:${recordId}:${name} [${mode} 모드]`,
    );

    // 교체모드시 해당하는 레코드의 기존 파일 삭제
    if (mode === 'replace') {
      // 다른 Attachment가 동일한 Blob을 참조할 수 있기 때문에
      // Blob은 삭제하지 않음
      const deleteResult = await AttachmentEntity.delete({
        recordType,
        recordId,
        name,
      });

      if (deleteResult.affected && deleteResult.affected > 0) {
        this.logger.log(
          `기존 첨부파일 ${deleteResult.affected}개 교체됨: ${recordType}:${recordId}:${name}`,
        );
      }
    }

    // 중복 파일 체크 (같은 checksum을 가진 blob이 있는지)
    const checksum = Utils.getChecksum(file.buffer);
    let blob = await BlobEntity.findOne({
      where: {
        checksum,
      },
    });

    // 새로운 파일이면 Blob 인스턴스 생성 및 저장
    if (!blob) {
      const buffer = file.buffer;
      const blobKey = Utils.generateFileKey();

      blob = BlobEntity.create({
        key: blobKey,
        serviceName: this.storage.getServiceName(),
        filename: file.originalname,
        checksum,
        byteSize: buffer.length,
        contentType: file.mimetype,
        metadata: { analyzed: false },
      });
      await blob.save();

      // 스토리지에 파일 저장
      await this.storage.store(blob.key, buffer);

      this.logger.log(
        `새 Blob 생성: ${blob.id} (key: ${blobKey}) - ${file.originalname}`,
      );
    } else {
      this.logger.log(
        `기존 Blob 재사용: ${blob.id} - ${file.originalname} (체크섬: ${checksum.substring(0, 8)}...)`,
      );
    }

    // 첨부 인스턴스 생성 및 저장
    const attachment = AttachmentEntity.create({
      name,
      recordType,
      recordId,
      blobId: blob.id,
      blob,
    } as AttachmentEntity);

    const savedAttachment = await attachment.save();

    this.logger.log(
      `파일 첨부 완료: ${file.originalname} → 첨부ID ${savedAttachment.id}`,
    );

    return savedAttachment;
  }

  /**
   * 여러 파일을 특정 도메인 레코드에 일괄 첨부
   *
   * @param files 업로드된 파일 배열 (Express.Multer.File[])
   * @param recordType 도메인 타입 (예: 'User', 'Post', 'Comment')
   * @param recordId 도메인 레코드의 고유 ID
   * @param name 첨부파일 분류명 (모든 파일에 동일하게 적용)
   * @param mode 첨부 모드 - 'replace': 기존 파일 교체, 'append': 추가 첨부
   * @returns 생성된 AttachmentEntity 배열 (각각 blob 관계 포함)
   *
   * @description
   * - 제공된 파일들을 순차적으로 처리하여 첨부합니다
   * - 각 파일마다 attach() 메서드를 호출하므로 중복 제거 로직 적용
   * - 모든 파일이 동일한 분류명(name)으로 첨부됩니다
   * - replace 모드시 첫 번째 파일에서만 기존 파일 삭제 수행
   *
   * 주의사항:
   * - 대용량 파일이나 많은 파일 처리시 성능 고려 필요
   * - 중간에 실패하면 일부만 첨부될 수 있음 (트랜잭션 미적용)
   */
  async attachMany(
    files: Express.Multer.File[],
    recordType: string,
    recordId: string,
    name: string,
    mode: 'replace' | 'append' = 'replace',
  ) {
    this.logger.log(
      `다중 파일 첨부 시작: ${files.length}개 파일 → ${recordType}:${recordId}:${name} [${mode} 모드]`,
    );

    const attachments: AttachmentEntity[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // 첫 번째 파일일 때만 replace 모드 적용, 나머지는 append
      const currentMode = i === 0 ? mode : 'append';

      try {
        const attachment = await this.attach(
          file,
          recordType,
          recordId,
          name,
          currentMode,
        );
        attachments.push(attachment);
      } catch (error) {
        this.logger.error(
          `다중 파일 첨부 중 오류 발생: ${file.originalname} (${i + 1}/${files.length})`,
          error,
        );
        throw error;
      }
    }

    this.logger.log(`다중 파일 첨부 완료: ${attachments.length}개 파일 처리됨`);

    return attachments;
  }

  /**
   * Blob의 메타데이터를 병합/업데이트합니다.
   *
   * @param blob        업데이트할 BlobEntity 인스턴스 (metadata는 readonly)
   * @param newMetadata 추가/병합할 메타데이터 객체
   *
   * @description
   * - 기존 blob.metadata와 newMetadata를 병합하여 DB에 저장합니다.
   * - analyzed 상태를 true로 자동 세팅합니다.
   * - metadata가 readonly이므로 인스턴스에는 반영하지 않습니다.
   * - 필요시 blob.reload() 등으로 재조회하여 동기화하세요.
   */
  async updateBlobMetadata(
    blob: BlobEntity,
    newMetadata: Record<string, any>,
  ): Promise<void> {
    const mergedMetadata: Record<string, any> = {
      ...blob.metadata,
      ...newMetadata,
      analyzed: true,
    };
    await BlobEntity.update(blob.id, { metadata: mergedMetadata });
    // blob.metadata = mergedMetadata; // metadata가 readonly이므로 할당 불가
  }

  /**
   * 특정 첨부파일 삭제
   *
   * @param attachmentId 삭제할 첨부파일의 고유 ID
   * @returns 삭제 결과 (affected rows 등)
   *
   * @description
   * - Attachment 레코드만 삭제됩니다
   * - 연관된 Blob은 삭제되지 않습니다 (다른 Attachment가 참조할 수 있음)
   * - 고아 Blob은 정기적인 가비지 컬렉션으로 정리됩니다
   */
  async detach(attachmentId: number) {
    this.logger.log(`첨부파일 삭제 시작: ID ${attachmentId}`);

    const result = await AttachmentEntity.delete({ id: attachmentId });

    if (result.affected && result.affected > 0) {
      this.logger.log(`첨부파일 삭제 완료: ID ${attachmentId}`);
    } else {
      this.logger.warn(`삭제할 첨부파일을 찾을 수 없음: ID ${attachmentId}`);
    }

    return result;
  }

  /**
   * 특정 도메인 레코드의 첨부파일들 일괄 삭제
   *
   * @param recordType 도메인 타입 (예: 'User', 'Post', 'Comment')
   * @param recordId 도메인 레코드의 고유 ID
   * @param name 첨부파일 분류명 (선택사항 - 지정시 해당 분류만 삭제)
   * @returns 삭제 결과 (affected rows 등)
   *
   * @description
   * - 지정된 조건에 맞는 모든 Attachment 레코드를 삭제합니다
   * - name이 제공되지 않으면 해당 레코드의 모든 첨부파일을 삭제
   * - name이 제공되면 해당 분류의 첨부파일만 삭제
   * - 연관된 Blob들은 삭제되지 않습니다
   */
  async detachAllByRecord(recordType: string, recordId: string, name?: string) {
    const whereCondition: any = { recordType, recordId };
    if (name !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      whereCondition.name = name;
    }

    const targetDescription = name
      ? `${recordType}:${recordId}:${name}의 첨부파일들`
      : `${recordType}:${recordId}의 모든 첨부파일들`;

    this.logger.log(`일괄 첨부파일 삭제 시작: ${targetDescription}`);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const result = await AttachmentEntity.delete(whereCondition);

    if (result.affected && result.affected > 0) {
      this.logger.log(
        `일괄 첨부파일 삭제 완료: ${result.affected}개 삭제됨 - ${targetDescription}`,
      );
    } else {
      this.logger.warn(`삭제할 첨부파일을 찾을 수 없음: ${targetDescription}`);
    }

    return result;
  }

  /**
   * 고아 Blob 정리 (Garbage Collection)
   *
   * @returns 삭제된 고아 Blob의 개수
   *
   * @description
   * 어떤 Attachment도 참조하지 않는 고아 Blob들을 찾아서 정리합니다.
   *
   * 본 시스템에서는 파일 삭제 시 Attachment만 삭제하고 Blob은 의도적으로 남겨둡니다:
   * - detach(): Attachment 레코드만 삭제, Blob은 유지
   * - detachAllByRecord(): 조건에 맞는 Attachment들만 삭제, Blob은 유지
   * - 이는 동일한 파일(checksum)을 여러 Attachment가 공유할 수 있기 때문입니다
   *
   * 고아 Blob이 생성되는 경우:
   * - detach() 호출로 마지막 Attachment가 삭제된 경우
   * - detachAllByRecord() 호출로 해당 Blob을 참조하는 모든 Attachment가 삭제된 경우
   * - 직접 DB 조작으로 Attachment만 삭제된 경우
   * - 애플리케이션 오류로 인한 데이터 불일치
   *
   * 주의사항:
   * - 실제 파일 삭제가 실패해도 DB 레코드는 삭제되지 않음 (안전장치)
   * - 대량의 고아 Blob 처리시 성능 고려 필요
   * - 트랜잭션 처리 없이 개별 삭제 수행
   * - 삭제 실패한 Blob은 로그로 기록되며 다음 실행 시 재시도됨
   *
   * @example
   * ```typescript
   * // 파일 삭제 후 정리 예시
   * await activeStorageService.detach(attachmentId); // Attachment만 삭제
   * // ... 나중에 배치로 실행
   * const deletedCount = await activeStorageService.cleanupOrphanedBlobs(); // 고아 Blob 정리
   *
   * // 스케줄러와 함께 사용
   * @Cron('0 2 * * 0') // 매주 일요일 새벽 2시
   * async handleWeeklyCleanup() {
   *   const deletedCount = await this.activeStorageService.cleanupOrphanedBlobs();
   *   this.logger.log(`Weekly cleanup: ${deletedCount} orphaned blobs deleted`);
   * }
   * ```
   */
  async cleanupOrphanedBlobs(): Promise<number> {
    this.logger.log('고아 Blob 정리 작업 시작');

    const orphanedBlobs = await BlobEntity.createQueryBuilder('blob')
      .leftJoin('blob.attachments', 'attachment')
      .where('attachment.id IS NULL')
      .getMany();

    if (orphanedBlobs.length === 0) {
      this.logger.log('정리할 고아 Blob이 없음');
      return 0;
    }

    this.logger.log(`${orphanedBlobs.length}개의 고아 Blob 발견, 정리 시작`);

    let deletedCount = 0;
    for (const blob of orphanedBlobs) {
      try {
        // 스토리지에서 실제 파일 삭제
        await this.storage.delete(blob.key);
        // 데이터베이스에서 Blob 레코드 삭제
        await blob.remove();
        deletedCount++;
        this.logger.debug(
          `고아 Blob 삭제 완료: ${blob.key} (${blob.filename})`,
        );
      } catch (error) {
        this.logger.error(
          `고아 Blob 삭제 실패: ${blob.key} (${blob.filename})`,
          error,
        );
      }
    }

    this.logger.log(
      `고아 Blob 정리 작업 완료: ${deletedCount}/${orphanedBlobs.length}개 삭제됨`,
    );

    return deletedCount;
  }
}
