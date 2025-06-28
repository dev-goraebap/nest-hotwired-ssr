export interface IStorageAdapter {
  // 서비스 이름 제공
  getServiceName(): string;
  /**
   * 파일을 저장소에 업로드
   * @param key 스토리지 키 (파일 경로)
   * @param file 파일 데이터 (Buffer)
   * @returns 저장된 파일의 키
   */
  store(key: string, file: Buffer): Promise<string>;
}

export const STORAGE_ADAPTER = 'STORAGE_ADAPTER';