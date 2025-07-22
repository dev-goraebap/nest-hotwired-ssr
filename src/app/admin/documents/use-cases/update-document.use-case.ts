import { BadRequestException, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { DocumentEntity, TranslationService } from 'src/shared';

import { UpdateDocumentDto } from '../dto/update-document.dto'; // Assuming you have an UpdateDocumentDto
import { DocumentValidateService } from '../services/document-validate.service';
import { AdminDocumentsService } from '../services/documents.service';

@Injectable()
export class UpdateDocumentUseCase {
  constructor(
    private readonly documentsService: AdminDocumentsService,
    private readonly translationService: TranslationService,
    private readonly documentValidateService: DocumentValidateService,
    private readonly entityManager: EntityManager,
  ) {}

  async execute(id: number, dto: UpdateDocumentDto): Promise<DocumentEntity> {
    // 1. 기존 문서 조회
    const existingDocument = await this.documentsService.getById(id);

    // 2. 비즈니스 로직 검증 (제목/슬러그 중복 등)
    await this.documentValidateService.validate(dto, existingDocument);

    // 3. 트랜잭션 실행
    return await this.entityManager.transaction(async (manager) => {
      // 문서 업데이트 (기본 정보: slug, category)
      const document = await this.documentsService.update(manager, id, dto);

      // 번역 업데이트 (병렬 처리)
      const translations = await Promise.allSettled([
        this.updateKoreanTranslation(manager, document, dto),
        this.updateEnglishTranslation(manager, document, dto),
      ]);

      // 번역 실패 처리
      this.handleTranslationFailures(translations);

      return document;
    });
  }

  private async updateKoreanTranslation(
    manager: EntityManager,
    document: DocumentEntity,

    dto: any,
  ) {
    // 한국어 번역 업데이트 (원본 데이터 그대로)
    return await this.documentsService.updateTranslation(
      manager,
      document.id,
      'ko',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      { title: dto.title, content: dto.content },
    );
  }

  private async updateEnglishTranslation(
    manager: EntityManager,
    document: DocumentEntity,

    dto: any,
  ) {
    // 영어 번역 자동 업데이트

    const englishTitle = await this.translationService.translateToEnglish(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      dto.title,
    );

    const englishContent = await this.translationService.translateHtmlContent(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      dto.content,
      'English',
    );

    return await this.documentsService.updateTranslation(
      manager,
      document.id,
      'en',
      { title: englishTitle, content: englishContent },
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
