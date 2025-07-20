import { BadRequestException, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { CategoryEntity, DocumentEntity, TranslationService } from 'src/shared';

import { AdminDocumentsService } from '../documents.service';
import { CreateDocumentDto } from '../dto/create-document.dto';

@Injectable()
export class CreateDocumentUseCase {
  constructor(
    private readonly documentsService: AdminDocumentsService,
    private readonly translationService: TranslationService,
    private readonly entityManager: EntityManager,
  ) {}

  async execute(dto: CreateDocumentDto): Promise<DocumentEntity> {
    const category = await CategoryEntity.findOne({
      where: { id: dto.categoryId },
    });
    if (!category) {
      throw new BadRequestException('카테고리를 찾을 수 없습니다.');
    }

    // 트랜잭션 실행
    return await this.entityManager.transaction(async (manager) => {
      // 문서 생성
      const document = await this.documentsService.create(category, dto);

      // 병렬로 번역 생성
      const translations = await Promise.allSettled([
        this.createKoreanTranslation(document, dto),
        this.createEnglishTranslation(document, dto),
      ]);

      // 번역 실패 처리
      this.handleTranslationFailures(translations);

      return document;
    });
  }

  private async createKoreanTranslation(document: DocumentEntity, dto: any) {
    // 한글로 작성할거기 때문에 그냥 그대로 저장
    return await this.documentsService.createTranslation(document, 'ko', {
      title: dto.title,
      content: dto.content,
    });
  }

  private async createEnglishTranslation(document: DocumentEntity, dto: any) {
    const englishTitle = await this.translationService.translateToEnglish(
      dto.title,
    );
    const englishContent = await this.translationService.translateHtmlContent(
      dto.content,
      'English',
    );

    return await this.documentsService.createTranslation(document, 'en', {
      title: englishTitle,
      content: englishContent,
    });
  }

  private handleTranslationFailures(translations: PromiseSettledResult<any>[]) {
    const koreanResult = translations[0];
    const englishResult = translations[1];

    // 한국어 번역 실패 체크
    if (koreanResult.status === 'rejected') {
      const error = koreanResult.reason;
      throw new BadRequestException(
        `한국어 번역 생성에 실패했습니다: ${error.message || error}`,
      );
    }

    // 영어 번역 실패 체크
    if (englishResult.status === 'rejected') {
      const error = englishResult.reason;
      throw new BadRequestException(
        `영어 번역 생성에 실패했습니다: ${error.message || error}`,
      );
    }
  }
}
