import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Result } from '../common/result';
import {
  AppVersionEntity,
  PlatformTypes,
} from '../entities/app-version.entity';

export interface CreateAppVersionDto {
  type: PlatformTypes;
  version: string;
  validYn?: string;
}

@Injectable()
export class AppVersionService {
  constructor(
    @InjectRepository(AppVersionEntity)
    private readonly repository: Repository<AppVersionEntity>,
  ) {}

  // 모든 앱 버전 가져오기
  async getAll(
    platform?: PlatformTypes,
    sort: string = 'latest',
  ): Promise<Result<AppVersionEntity[]>> {
    try {
      // 쿼리 빌더 시작
      const queryBuilder = this.repository.createQueryBuilder('app_version');

      // 플랫폼 필터 적용
      if (platform) {
        queryBuilder.where('app_version.type = :type', { type: platform });
      }

      // 정렬 적용
      if (sort === 'oldest') {
        queryBuilder.orderBy('app_version.createdAt', 'ASC');
      } else {
        queryBuilder.orderBy('app_version.createdAt', 'DESC'); // 기본값: 최신순
      }

      const versions = await queryBuilder.getMany();

      return Result.success(
        versions,
        '앱 버전 목록이 성공적으로 조회되었습니다.',
      );
    } catch (error) {
      return Result.failure(
        `앱 버전 목록 조회 중 오류가 발생했습니다: ${error.message}`,
      );
    }
  }

  // 특정 플랫폼과 버전으로 앱 버전 가져오기
  async getByTypeAndVersion(
    type: PlatformTypes,
    version: string,
  ): Promise<Result<AppVersionEntity | null>> {
    try {
      const appVersion = await this.repository.findOne({
        where: { type, version },
      });
      return Result.success(appVersion);
    } catch (error) {
      return Result.failure(
        `앱 버전 조회 중 오류가 발생했습니다: ${error.message}`,
      );
    }
  }

  // 앱 버전 생성
  async create(dto: CreateAppVersionDto): Promise<Result<AppVersionEntity>> {
    try {
      // 버전 형식 검증
      if (!this.isValidVersionFormat(dto.version)) {
        return Result.failure('버전은 숫자와 점(.)만 사용할 수 있습니다.');
      }

      // 이미 존재하는지 확인
      const existingResult = await this.getByTypeAndVersion(
        dto.type,
        dto.version,
      );
      if (existingResult.data) {
        return Result.failure('이미 등록된 플랫폼과 버전 조합입니다.');
      }

      // validYn이 주어지지 않았다면 기본값 'N'으로 설정
      const appVersionData = {
        ...dto,
        validYn: dto.validYn || 'N',
      };

      const appVersion = this.repository.create(appVersionData);
      const savedAppVersion = await this.repository.save(appVersion);

      return Result.success(
        savedAppVersion,
        '앱 버전이 성공적으로 등록되었습니다.',
      );
    } catch (error) {
      return Result.failure(
        `앱 버전 등록 중 오류가 발생했습니다: ${error.message}`,
      );
    }
  }

  // 버전 형식 검증 (숫자와 점만 허용)
  private isValidVersionFormat(version: string): boolean {
    const versionRegex = /^[0-9.]+$/;
    return versionRegex.test(version);
  }

  // validYn 업데이트
  async updateValidYn(
    type: PlatformTypes,
    version: string,
    validYn: string,
  ): Promise<Result<AppVersionEntity | null>> {
    try {
      const updateResult = await this.repository.update(
        { type, version },
        { validYn },
      );

      if (updateResult.affected === 0) {
        return Result.failure(`해당 앱 버전을 찾을 수 없습니다.`);
      }

      const updatedAppVersion = await this.repository.findOne({
        where: { type, version },
      });

      console.log(updatedAppVersion);

      return Result.success(
        updatedAppVersion,
        '앱 버전 상태가 성공적으로 업데이트되었습니다.',
      );
    } catch (error) {
      return Result.failure(
        `앱 버전 상태 업데이트 중 오류가 발생했습니다: ${error.message}`,
      );
    }
  }

  // 앱 버전 삭제
  async delete(type: PlatformTypes, version: string): Promise<Result<void>> {
    try {
      const result = await this.repository.delete({ type, version });

      if (result.affected === 0) {
        return Result.failure(`해당 앱 버전을 찾을 수 없습니다.`);
      }

      return Result.success(null, '앱 버전이 성공적으로 삭제되었습니다.');
    } catch (error) {
      return Result.failure(
        `앱 버전 삭제 중 오류가 발생했습니다: ${error.message}`,
      );
    }
  }

  // UI에서 사용할 플랫폼 타입 목록
  getPlatformTypes() {
    return Object.values(PlatformTypes);
  }
}
