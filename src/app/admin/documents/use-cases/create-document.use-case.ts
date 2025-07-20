import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { CategoryEntity, DocumentEntity, TranslationService } from 'src/shared';

import { AdminDocumentsService } from '../services/documents.service';
import { CreateDocumentDto } from '../dto/create-document.dto';
import { DocumentValidateService } from '../services/document-validate.service';

@Injectable()
export class CreateDocumentUseCase {
  constructor(
    private readonly documentsService: AdminDocumentsService,
    private readonly translationService: TranslationService,
    private readonly documentValidateService: DocumentValidateService,
    private readonly entityManager: EntityManager,
  ) {}

  async execute(dto: CreateDocumentDto): Promise<DocumentEntity> {
    // 1. 카테고리 조회 및 존재 여부 확인
    const category = await CategoryEntity.findOne({
      where: { id: dto.categoryId },
    });
    if (!category) {
      throw new NotFoundException('카테고리를 찾을 수 없습니다.');
    }

    // 2. 비즈니스 로직 검증 (제목/슬러그 중복 등)
    await this.documentValidateService.validate(dto);

    // 3. 트랜잭션 실행
    return await this.entityManager.transaction(async (manager) => {
      // 문서 생성
      const document = await this.documentsService.create(
        manager,
        category,
        dto,
      );

      // 병렬로 번역 생성
      const translations = await Promise.allSettled([
        this.createKoreanTranslation(manager, document, dto),
        this.createEnglishTranslation(manager, document, dto),
      ]);

      // 번역 실패 처리
      this.handleTranslationFailures(translations);

      return document;
    });
  }
  '';

  private async createKoreanTranslation(manager: EntityManager, document: DocumentEntity, dto: any) {
    // 한글로 작성할거기 때문에 그냥 그대로 저장
    return await this.documentsService.createTranslation(manager, document, 'ko', {
      title: dto.title,
      content: dto.content,
    });
  }

  private async createEnglishTranslation(
    manager: EntityManager,
    document: DocumentEntity,
    dto: any,
  ) {
    const englishTitle = await this.translationService.translateToEnglish(
      dto.title,
    );
    const englishContent = await this.translationService.translateHtmlContent(
      dto.content,
      'English',
    );

    return await this.documentsService.createTranslation(manager, document, 'en', {
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
