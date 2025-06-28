/**
 * Storage Adapter 인터페이스
 * 
 * 실제 파일 저장소와의 상호작용을 담당하는 인터페이스
 * Local File System, AWS S3, Google Cloud Storage 등 다양한 저장소 구현체에서 구현
 * 
 * @description
 * - 해당 모듈은 기본적으로 로컬 파일 시스템을 사용합니다.
 * - AWS S3, GCS 등의 클라우드 스토리지를 사용하게 되면 인터페이스를 확장하여 사용할 수 있습니다.
 * - Rails Active Storage의 Service 패턴과 동일한 구조입니다.
 * 
 * @example
 * // 기본으로 사용하는 Local Storage 구현체
 * class LocalStorageAdapter implements IStorageAdapter { ... }
 * 
 * // AWS S3 구현체  
 * class S3StorageAdapter implements IStorageAdapter { ... }
 * 
 * // Google Cloud Storage 구현체
 * class GCSStorageAdapter implements IStorageAdapter { ... }
 */
export interface IStorageAdapter {
  /**
   * 파일을 저장소에 업로드
   * @param key 스토리지 키 (파일 경로)
   * @param file 파일 데이터 (Buffer)
   * @returns 저장된 파일의 키
   */
  store(key: string, file: Buffer): Promise<string>;

  /**
   * 저장소에서 파일 다운로드
   * @param key 스토리지 키
   * @returns 파일 데이터 (Buffer)
   */
  retrieve(key: string): Promise<Buffer>;

  /**
   * 저장소에서 파일 삭제
   * @param key 스토리지 키
   */
  delete(key: string): Promise<void>;

  /**
   * 파일 존재 여부 확인
   * @param key 스토리지 키
   * @returns 파일 존재 여부
   */
  exists(key: string): Promise<boolean>;

  /**
   * 파일의 공개 URL 생성
   * @param key 스토리지 키
   * @param options 추가 옵션 (만료시간, 권한 등)
   * @returns 파일 접근 URL
   * 
   * @description
   * - 로컬의 경우 즉시 URL 반환
   * - S3/GCS: 비동기로 Signed URL 생성
   */
  getUrl(key: string, options?: Record<string, any>): string | Promise<string>;

  /**
   * 스토리지 서비스명 반환
   * @returns 서비스명 ('local', 's3', 'gcs' 등)
   */
  getServiceName(): string;
}
