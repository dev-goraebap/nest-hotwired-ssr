import { BadRequestException, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { CategoryEntity, TranslationService } from 'src/shared';

import { AdminCategoriesService } from '../categories.service';

@Injectable()
export class UpdateCategoryUseCase {
  constructor(
    private readonly categoriesService: AdminCategoriesService,
    private readonly translationService: TranslationService,
    private readonly entityManager: EntityManager,
  ) {}

  async execute(id: number, dto: any): Promise<CategoryEntity> {
    return await this.entityManager.transaction(async (manager) => {
      // 카테고리 조회
      const category = await this.categoriesService.getById(id);

      // 번역 업데이트 (병렬 처리)
      const translations = await Promise.allSettled([
        this.updateKoreanTranslation(category, dto, manager),
        this.updateEnglishTranslation(category, dto, manager),
      ]);

      // 번역 실패 처리
      this.handleTranslationFailures(translations);

      return category;
    });
  }

  private async updateKoreanTranslation(
    category: CategoryEntity,
    dto: any,
    manager: EntityManager,
  ) {
    return await this.categoriesService.updateTranslation(
      category.id,
      'ko',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      { name: dto.name, description: dto.description || '' },
      manager,
    );
  }

  private async updateEnglishTranslation(
    category: CategoryEntity,
    dto: any,
    manager: EntityManager,
  ) {
    const englishName = await this.translationService.translateToEnglish(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      dto.name,
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const englishDescription = dto.description
      ? // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        await this.translationService.translateToEnglish(dto.description)
      : '';

    return await this.categoriesService.updateTranslation(
      category.id,
      'en',
      { name: englishName, description: englishDescription },
      manager,
    );
  }

  private handleTranslationFailures(translations: PromiseSettledResult<any>[]) {
    const koreanResult = translations[0];
    const englishResult = translations[1];

    // 한국어 번역 실패 체크
    if (koreanResult.status === 'rejected') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const error = koreanResult.reason;
      throw new BadRequestException(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `한국어 번역 업데이트에 실패했습니다: ${error.message || error}`,
      );
    }

    // 영어 번역 실패 체크
    if (englishResult.status === 'rejected') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const error = englishResult.reason;
      throw new BadRequestException(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `영어 번역 업데이트에 실패했습니다: ${error.message || error}`,
      );
    }
  }
}
