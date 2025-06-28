import { IAttachmentModel } from "./attachment.model";
import { IBlobModel } from "./blob.model";

export interface IActiveStorageRepository {
    /**-----------------------------------------------------
     * Attachment
     * ----------------------------------------------------*/

    /**
     * 특정 도메인에 해당하는 첨부 파일 목록 조회
     * - 파일유형이름이 포함되면 해당 필터까지 적용
     */
    findAttachmentByRecordType(recordType: string, name: string | undefined): Promise<IAttachmentModel[]>;
    // 첨부모델 객체 생성
    createAttachment(name: string, recordType: string, recordId: string, blob: IBlobModel): IAttachmentModel;
    // 첨부모델 저장
    saveAttachment(attachment: IAttachmentModel): Promise<IAttachmentModel>;
    // 레코드타입과 첨부유형이름에 해당하는 모든 레코드 제거
    deleteAttachmentsByRecordTypeAndName(recordType: string, name: string): Promise<void>;

    /** ----------------------------------------------------
     * Blob
     * ----------------------------------------------------*/

    // 채크섬으로 파일정보 조회
    findBlobByChecksum(checksum: string): Promise<IBlobModel | null>;
    // 파일정보 인스턴스 생성
    createBlob(buffer: Buffer, filename: string, contentType: string, serviceName: string): IBlobModel;
    // 파일정보 저장
    saveBlob(blob: IBlobModel): Promise<IBlobModel>;
}

export const ACTIVE_STORAGE_REPOSITORY = 'ACTIVE_STORAGE_REPOSITORY';
