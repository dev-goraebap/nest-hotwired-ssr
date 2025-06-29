export interface StoragePort {
  // 서비스 이름 제공
  getServiceName(): string;

  /**
   * 파일을 저장소에 업로드
   * @param key 스토리지 키 (파일 경로)
   * @param file 파일 데이터 (Buffer)
   * @returns 저장된 파일의 키
   */
  store(key: string, file: Buffer): Promise<string>;

  /**
   * 파일을 저장소에서 삭제
   * @param key 스토리지 키 (파일 경로)
   */
  delete(key: string): Promise<void>;
}

export const STORAGE_PORT = 'STORAGE_PORT';
