import { createHash, randomBytes } from 'crypto';
import * as path from 'path';

/**
 * TypeORM Active Storage 내부 유틸리티 클래스
 *
 * @description
 * - 파일 저장소 관련 공통 기능을 제공하는 내부 전용 유틸리티
 * - 서비스, 어댑터, 엔티티에서 공통으로 사용되는 기능들
 *
 * 설계 원칙:
 * - 모든 메서드는 static으로 상태를 갖지 않음
 * - 순수 함수로 구성하여 테스트 용이성 확보
 * - 모듈 내부 전용으로 외부 노출 금지
 */
export class Utils {
  /**
   * 파일 키 생성 (Ruby on rails의 방식 차용)
   *
   * @return
   * - 16바이트 (32자리 hex) + 2바이트 (4자리 hex) = 총 36자리 hex 문자열
   * - 예시: "a1b2c3d4e5f6789012345678901234567890abcd"
   *
   * @description
   * 구조:
   * - 16바이트 (128비트): 메인 랜덤 키 (충돌 확률 극도로 낮음)
   * - 2바이트 (16비트): 추가 엔트로피 (더 안전한 고유성 보장)
   *
   * 장점:
   * 1. 고유성 보장: 2^144 가지 경우의 수 (사실상 충돌 불가능)
   * 2. 디렉토리 샤딩: 처음 4자리로 ab/cd/ 구조 생성 가능
   * 3. URL 안전: 특수문자 없이 hex만 사용
   * 4. 예측 불가능: 순차적이지 않아 보안상 안전
   * 5. 고정 길이: 36자리로 일관성 있음
   */
  static generateFileKey(): string {
    return randomBytes(16).toString('hex') + randomBytes(2).toString('hex');
  }

  /**
   * 파일 내용의 체크섬 생성 (중복 파일 감지용)
   *
   * @param 파일의 Buffer 데이터
   * @returns MD5 해시값 (32자리 hex 문자열)
   *
   * @description
   * - MD5 해시 알고리즘으로 파일 내용의 고유 지문 생성
   * - 같은 내용의 파일은 항상 같은 체크섬을 가짐
   * - 파일 중복 제거 및 무결성 검증에 사용
   *
   * 사용 목적:
   * 1. 중복 파일 감지: 같은 체크섬 = 같은 파일
   * 2. 파일 무결성 검증: 전송/저장 후 변조 확인
   * 3. 스토리지 최적화: 중복 파일 저장 방지
   *
   * MD5를 사용하는 이유:
   * - 빠른 계산 속도 (대용량 파일 처리 적합)
   * - 32자리 고정 길이로 인덱스 효율적
   * - 암호화 용도가 아닌 파일 식별 용도로는 충분
   *
   * 주의사항:
   * - 보안/암호화 목적으로는 부적합 (충돌 가능성 존재)
   * - 파일 식별 목적으로만 사용
   */
  static getChecksum(buffer: Buffer): string {
    return createHash('md5').update(buffer).digest('hex');
  }

  /**
   * 키를 기반으로 파일 경로 생성
   *
   * @param key 파일 키 (예: "abcd1234ef567890")
   * @returns 파일 경로 (예: "/storage/uploads/ab/cd/abcd1234ef567890")
   *
   * @description
   * 이 구조의 장점들:
   * 1. 파일시스템 성능 최적화
   *    - 한 디렉토리에 수만개 파일이 있으면 파일 검색 속도가 급격히 느려짐
   *    - 2단계 디렉토리로 분산하면 각 디렉토리당 최대 256개 하위폴더
   *    - 예: 100만개 파일을 256×256=65,536개 폴더에 분산 저장
   *
   * 2. 균등한 분산
   *    - 16진수 기반이므로 0-f까지 균등하게 분산됨
   *    - 특정 폴더에 파일이 몰리는 현상 방지
   *
   * 3. 확장성
   *    - 필요시 3단계(ab/cd/ef/abcdef...)로 쉽게 확장 가능
   *    - Git 객체 저장소와 동일한 방식 (proven pattern)
   *
   * 4. 백업/동기화 효율성
   *    - 디렉토리 단위로 병렬 처리 가능
   *    - rsync 등 도구 사용시 효율적
   *
   * 5. 운영 관리 편의성
   *    - 파일 개수를 디렉토리 단위로 쉽게 파악 가능
   *    - 특정 시간대 파일들을 디렉토리로 구분 가능
   */
  static getFilePath(rootPath: string, key: string): string {
    // 키의 처음 4자리를 이용해 2단계 디렉토리 구조 생성
    const dir1 = key.substring(0, 2);
    const dir2 = key.substring(2, 4);
    return path.join(rootPath, dir1, dir2, key);
  }

  /**
   * GCS용 파일 경로 생성 (로컬 파일 시스템과 동일한 계층 구조)
   *
   * @param key 파일 키 (예: "abcd1234ef567890")
   * @returns GCS 객체 경로 (예: "ab/cd/abcd1234ef567890")
   *
   * @description
   * - 로컬 스토리지와 동일한 디렉토리 구조를 GCS에서도 사용
   * - GCS는 실제 디렉토리가 아닌 객체명의 슬래시(/)로 계층 표현
   * - 버킷 브라우저에서 폴더 구조로 보임
   */
  static getGcsFilePath(key: string): string {
    const dir1 = key.substring(0, 2);
    const dir2 = key.substring(2, 4);
    return `${dir1}/${dir2}/${key}`;
  }
}
