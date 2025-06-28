import { IBlobModel } from './blob.model';

/**
 * 첨부 모델 속성 정의
 *
 * @description
 * - 파일 업로드시 파일을 첨부할 도메인과의 간접적인 연결정보 속성 정의
 */
export type AttachmentData = {
  readonly id: string; // 고유한 첨부ID
  readonly name: string; // 파일분류이름 image, document 등등, 조회에 관련되어 사용
  readonly recordType: string; // 파일을 사용하는 도메인 타입 (user, post, test ...)
  readonly recordId: string; // 도메인의 특정 레코드 ID
  readonly blobId: string; // 파일의 특정 레코드 ID
  readonly createdAt: Date; // 생성일
  readonly blob: IBlobModel; // 연결된 파일 모델
};

/**
 * 파일 모델의 행동 정의
 *
 * @description
 * - ActiveStorageService 에서 해당 인터페이스를 참조
 */
export interface IAttachmentModel extends AttachmentData {}
