import { BadRequestException, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { CategoryEntity, TranslationService } from 'src/shared';

import { AdminCategoriesService } from '../categories.service';

@Injectable()
export class CreateCategoryUseCase {
  constructor(
    private readonly categoriesService: AdminCategoriesService,
    private readonly translationService: TranslationService,
    private readonly entityManager: EntityManager,
  ) {}

  async execute(dto: any): Promise<CategoryEntity> {
    return await this.entityManager.transaction(async (manager) => {
      // 카테고리 생성
      const category = await this.categoriesService.create(dto, manager);

      // 번역 생성 (병렬 처리)
      const translations = await Promise.allSettled([
        this.createKoreanTranslation(category, dto, manager),
        this.createEnglishTranslation(category, dto, manager),
      ]);

      // 번역 실패 처리
      this.handleTranslationFailures(translations);

      return category;
    });
  }

  private async createKoreanTranslation(
    category: CategoryEntity,
    dto: any,
    manager: EntityManager,
  ) {
    return await this.categoriesService.createTranslation(
      category.id,
      'ko',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      { name: dto.name, description: dto.description || '' },
      manager,
    );
  }

  private async createEnglishTranslation(
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

    return await this.categoriesService.createTranslation(
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
        `한국어 번역 생성에 실패했습니다: ${error.message || error}`,
      );
    }

    // 영어 번역 실패 체크
    if (englishResult.status === 'rejected') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const error = englishResult.reason;
      throw new BadRequestException(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `영어 번역 생성에 실패했습니다: ${error.message || error}`,
      );
    }
  }
}
