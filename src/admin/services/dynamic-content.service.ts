import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Result } from '../common/result';
import { DynamicContentEntity } from '../entities/dynamic-content.entity';

export interface CreateDynamicContentDto {
  screenType: 'main' | 'detail';
  contentType: 'A' | 'B';
  content: string;
}

export interface UpdateDynamicContentDto {
  screenType?: 'main' | 'detail';
  contentType?: 'A' | 'B';
  content?: string;
}

@Injectable()
export class DynamicContentService {
  constructor(
    @InjectRepository(DynamicContentEntity)
    private readonly repository: Repository<DynamicContentEntity>,
  ) {}

  async getContentsByScreenType(
    screenType: string,
  ): Promise<DynamicContentEntity[]> {
    // 현재 사용중인 (useYn='Y') 컨텐츠를 먼저 가져오고, 그 다음에 나머지 컨텐츠를 생성일 내림차순으로 가져옴
    const contents = await this.repository
      .createQueryBuilder('content')
      .where('content.screenType = :screenType', { screenType })
      .orderBy('content.useYn', 'DESC') // Y가 먼저 오게
      .addOrderBy('content.createdAt', 'DESC') // 같은 useYn 값에서는 최신순
      .getMany();

    return contents;
  }

  async getByScreenTypeAndContentType(
    screenType: string,
    contentType: string,
  ): Promise<DynamicContentEntity | null> {
    return this.repository.findOne({
      where: {
        screenType,
        contentType,
        useYn: 'Y',
      },
    });
  }

  async getById(id: string): Promise<DynamicContentEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  async create(
    dto: CreateDynamicContentDto,
  ): Promise<Result<DynamicContentEntity>> {
    try {
      // 유효성 검사
      if (!dto.content) {
        return Result.failure('컨텐츠 내용은 필수입니다.');
      }

      // 새 컨텐츠 생성 - 항상 useYn은 'N'으로 설정
      const newContent = this.repository.create({
        id: uuidv4(), // 난수 ID 생성
        screenType: dto.screenType,
        contentType: dto.contentType,
        content: dto.content,
        useYn: 'N', // 항상 비활성 상태로 시작
      });

      const savedContent = await this.repository.save(newContent);
      return Result.success(
        savedContent,
        '다이나믹 컨텐츠가 성공적으로 등록되었습니다.',
      );
    } catch (error) {
      return Result.failure(
        `다이나믹 컨텐츠 등록 중 오류가 발생했습니다: ${error.message}`,
      );
    }
  }

  async update(
    id: string,
    dto: UpdateDynamicContentDto,
  ): Promise<Result<DynamicContentEntity>> {
    try {
      const content = await this.getById(id);

      if (!content) {
        return Result.failure('해당 컨텐츠를 찾을 수 없습니다.');
      }

      // 유효성 검사
      if (!dto.content) {
        return Result.failure('컨텐츠 내용은 필수입니다.');
      }

      // 수정 내용 적용
      const updatedContent = this.repository.create({
        ...content,
        ...dto,
        // useYn 값은 그대로 유지
        useYn: content.useYn,
      });

      const savedContent = await this.repository.save(updatedContent);
      return Result.success(
        savedContent,
        '다이나믹 컨텐츠가 성공적으로 수정되었습니다.',
      );
    } catch (error) {
      return Result.failure(
        `다이나믹 컨텐츠 수정 중 오류가 발생했습니다: ${error.message}`,
      );
    }
  }

  async changeUseStatus(id: string): Promise<Result<void>> {
    try {
      const content = await this.repository.findOne({ where: { id } });

      if (!content) {
        return Result.failure('해당 컨텐츠를 찾을 수 없습니다.');
      }

      // 이미 사용중인 경우는 변경하지 않음
      if (content.useYn === 'Y') {
        return Result.failure('이미 사용 중인 컨텐츠입니다.');
      }

      // 같은 화면타입+컨텐츠타입 조합의 기존 사용중인 컨텐츠 찾기
      const currentActiveContent = await this.getByScreenTypeAndContentType(
        content.screenType,
        content.contentType,
      );

      // 트랜잭션으로 처리 - 기존 컨텐츠 비활성화 및 새 컨텐츠 활성화
      await this.repository.manager.transaction(async (manager) => {
        // 기존 활성 컨텐츠가 있다면 비활성화
        if (currentActiveContent) {
          await manager.update(
            DynamicContentEntity,
            { id: currentActiveContent.id },
            { useYn: 'N' },
          );
        }

        // 선택한 컨텐츠 활성화
        await manager.update(DynamicContentEntity, { id }, { useYn: 'Y' });
      });

      return Result.success(null, '컨텐츠 상태가 변경되었습니다.');
    } catch (error) {
      return Result.failure(
        `컨텐츠 상태 변경 중 오류가 발생했습니다: ${error.message}`,
      );
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      const content = await this.repository.findOne({ where: { id } });

      if (!content) {
        return Result.failure('해당 컨텐츠를 찾을 수 없습니다.');
      }

      // 사용 중인 컨텐츠인지 확인 (선택적으로 사용 중인 컨텐츠 삭제 막기)
      if (content.useYn === 'Y') {
        return Result.failure(
          '현재 사용 중인 컨텐츠는 삭제할 수 없습니다. 먼저 다른 컨텐츠를 사용 상태로 변경해주세요.',
        );
      }

      await this.repository.delete(id);
      return Result.success(null, '컨텐츠가 성공적으로 삭제되었습니다.');
    } catch (error) {
      return Result.failure(
        `컨텐츠 삭제 중 오류가 발생했습니다: ${error.message}`,
      );
    }
  }
}
