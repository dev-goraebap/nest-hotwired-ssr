/**
 * Blob 타입
 * 
 * 실제 파일의 메타데이터를 저장하는 데이터 구조
 * 
 * @example
 * {
 *   key: 'ab/c1/abc123def456...',
 *   filename: 'avatar.jpg',
 *   contentType: 'image/jpeg',
 *   byteSize: 245760,
 *   checksum: 'a1b2c3d4e5f6...'
 * }
 */
export type BlobData = {
  id: string;
  key: string; // 스토리지키(파일경로) - Rails 스타일 경로 구조
  filename: string; // 원본파일명
  contentType: string; // MIME 타입 (image/jpeg, text/plain 등)
  metadata: Record<string, any>; // 메타데이터 (이미지 크기, 분석 정보 등)
  serviceName: string; // 스토리지서비스명 (local, s3, gcs 등)
  byteSize: number; // 파일크기 (바이트)
  checksum: string; // MD5 체크섬 (파일 무결성 검증용)
  createdAt: Date;
};
