/**
 * 파일 모델 속성 정의
 *
 * @description
 * - 파일 업로드시 파일에 관련된 정보를 저장할 데이터셋
 */
export type BlobData = {
  readonly id: string;
  readonly key: string;
  readonly filename: string;
  readonly contentType: string;
  readonly serviceName: string;
  readonly byteSize: number;
  readonly checksum: string;
  readonly metadata: any;
  readonly createdAt: Date;
};

/**
 * 파일 모델의 행동 정의
 *
 * @description
 * - ActiveStorageService 에서 해당 인터페이스를 참조
 */
export interface IBlobModel extends BlobData {
  // 파일 경로 제공
  getFilePath(): string;
  // 이미지 파일인지 확인
  isImage(): boolean;
  // 비디오 파일인지 확인
  isVideo(): boolean;
  // 오디오 파일인지 확인
  isAudio(): boolean;
  // 텍스트 파일인지 확인
  isText(): boolean;
  // 파일 크기를 사람이 읽기 쉬운 형태로 변환
  getHumanFileSize(): string;
  // 파일 확장자 추출
  getExtension(): string;
}
