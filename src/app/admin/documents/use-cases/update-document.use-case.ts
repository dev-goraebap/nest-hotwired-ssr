import { BadRequestException, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { DocumentEntity, TranslationService } from 'src/shared';

import { AdminDocumentsService } from '../documents.service';

@Injectable()
export class UpdateDocumentUseCase {
  constructor(
    private readonly documentsService: AdminDocumentsService,
    private readonly translationService: TranslationService,
    private readonly entityManager: EntityManager,
  ) {}

  async execute(id: number, dto: any): Promise<DocumentEntity> {
    return await this.entityManager.transaction(async (manager) => {
      // 문서 업데이트 (기본 정보: slug, category)
      const document = await this.documentsService.update(id, dto, manager);

      // 번역 업데이트 (병렬 처리)
      const translations = await Promise.allSettled([
        this.updateKoreanTranslation(document, dto, manager),
        this.updateEnglishTranslation(document, dto, manager),
      ]);

      // 번역 실패 처리
      this.handleTranslationFailures(translations);

      return document;
    });
  }

  private async updateKoreanTranslation(
    document: DocumentEntity,
    dto: any,
    manager: EntityManager,
  ) {
    // 한국어 번역 업데이트 (원본 데이터 그대로)
    return await this.documentsService.updateTranslation(
      document.id,
      'ko',
      { title: dto.title, content: dto.content },
      manager,
    );
  }

  private async updateEnglishTranslation(
    document: DocumentEntity,
    dto: any,
    manager: EntityManager,
  ) {
    // 영어 번역 자동 업데이트
    const englishTitle = await this.translationService.translateToEnglish(
      dto.title,
    );
    const englishContent = await this.translationService.translateHtmlContent(
      dto.content,
      'English',
    );

    return await this.documentsService.updateTranslation(
      document.id,
      'en',
      { title: englishTitle, content: englishContent },
      manager,
    );
  }

  private handleTranslationFailures(translations: PromiseSettledResult<any>[]) {
    const koreanResult = translations[0];
    const englishResult = translations[1];

    // 한국어 번역 실패 체크
    if (koreanResult.status === 'rejected') {
      const error = koreanResult.reason;
      throw new BadRequestException(
        `한국어 번역 업데이트에 실패했습니다: ${error.message || error}`,
      );
    }

    // 영어 번역 실패 체크
    if (englishResult.status === 'rejected') {
      const error = englishResult.reason;
      throw new BadRequestException(
        `영어 번역 업데이트에 실패했습니다: ${error.message || error}`,
      );
    }
  }
}
