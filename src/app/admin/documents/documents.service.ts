import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager, Not } from 'typeorm';

import { CategoryEntity, DocumentEntity, DocumentTranslationEntity } from 'src/shared';

@Injectable()
export class AdminDocumentsService {
  constructor(private readonly entityManager: EntityManager) {}

  index() {
    return DocumentEntity.find({
      relations: {
        category: {
          translations: true,
        },
        translations: true,
      },
      where: {
        translations: {
          languageCode: 'ko',
        },
        category: {
          translations: {
            languageCode: 'ko',
          },
        },
      },
      order: {
        createdAt: 'asc',
      },
    });
  }

  async getById(id: number) {
    const result = await DocumentEntity.findOne({
      where: {
        id,
        translations: {
          languageCode: 'ko',
        },
        category: {
          translations: {
            languageCode: 'ko',
          },
        },
      },
      relations: {
        category: {
          translations: true,
        },
        translations: true,
      },
    });
    if (!result) {
      throw new NotFoundException('게시물을 찾을 수 없습니다.');
    }
    return result;
  }

  async create(dto: any, manager?: EntityManager): Promise<DocumentEntity> {
    const em = manager || this.entityManager;

    // 유효성 검증 및 데이터 준비 (slug, category만 필요)
    const { slug, category } = await this.validateAndPrepareData(dto);

    const document = em.create(DocumentEntity, {
      slug,
      category,
    });

    return await em.save(document);
  }

  async createTranslation(
    documentId: number,
    languageCode: string,
    translationDto: { title: string; content: string },
    manager?: EntityManager,
  ): Promise<DocumentTranslationEntity> {
    const em = manager || this.entityManager;

    const translation = em.create(DocumentTranslationEntity, {
      document: { id: documentId },
      languageCode,
      title: translationDto.title,
      content: translationDto.content,
    });

    return await em.save(translation);
  }

  async update(
    id: number,
    dto: any,
    manager?: EntityManager,
  ): Promise<DocumentEntity> {
    const em = manager || this.entityManager;

    const document = await DocumentEntity.findOne({ where: { id } });
    if (!document) {
      throw new BadRequestException('문서를 찾을 수 없습니다.');
    }

    const { slug, category } = await this.validateAndPrepareData(dto, document);

    // 문서 기본 정보 업데이트 (slug, category만)
    Object.assign(document, { slug, category });
    await em.save(document);

    return document;
  }

  async updateTranslation(
    documentId: number,
    languageCode: string,
    translationDto: { title: string; content: string },
    manager?: EntityManager,
  ): Promise<DocumentTranslationEntity> {
    const em = manager || this.entityManager;

    let translation = await em.findOne(DocumentTranslationEntity, {
      where: { document: { id: documentId }, languageCode },
    });

    if (!translation) {
      // 번역이 없으면 생성
      translation = em.create(DocumentTranslationEntity, {
        document: { id: documentId },
        languageCode,
        title: translationDto.title,
        content: translationDto.content,
      });
    } else {
      // 기존 번역 업데이트
      Object.assign(translation, translationDto);
    }

    return await em.save(translation);
  }

  async destroy(id: number) {
    const document = await DocumentEntity.findOne({
      where: { id },
    });
    if (!document) {
      throw new BadRequestException('문서를 찾을 수 없습니다.');
    }
    await document.remove();
  }

  // 공통 유효성 검증 및 데이터 준비 로직
  private async validateAndPrepareData(
    dto: any,
    existingDocument?: DocumentEntity,
  ) {
    const { title, content, slug: rawSlug, category: ctg } = dto;
    const categoryId = ctg?.id;

    // 필수 필드 검증
    if (!title) throw new BadRequestException('제목을 입력해 주세요.');
    if (!content) throw new BadRequestException('내용을 입력해 주세요.');
    if (!rawSlug) throw new BadRequestException('슬러그를 만들어 주세요.');
    if (!categoryId) throw new BadRequestException('카테고리를 선택해 주세요.');

    // Slug 검증 (RESTful 규칙에 맞게)
    let slug = rawSlug;

    // 대문자 검사
    if (slug !== slug.toLowerCase()) {
      throw new BadRequestException('슬러그는 소문자만 허용됩니다.');
    }

    // 공백 검사
    if (/\s/.test(slug)) {
      throw new BadRequestException('슬러그에 공백이 포함될 수 없습니다.');
    }

    // 형식 검증 (영문, 숫자, 하이픈, 슬래시만 허용)
    if (!/^[a-z0-9\-\/]+$/.test(slug)) {
      throw new BadRequestException(
        '슬러그는 영문 소문자, 숫자, 하이픈(-), 슬래시만 사용할 수 있습니다.',
      );
    }

    // 카테고리 존재 확인
    const category = await CategoryEntity.findOne({
      where: { id: categoryId },
    });
    if (!category) {
      throw new NotFoundException('카테고리를 찾을 수 없습니다.');
    }

    // 제목 중복 검증 (번역 테이블에서 한국어 기준으로)
    if (!existingDocument) {
      const existsByTitle = await DocumentTranslationEntity.findOne({
        where: { title, languageCode: 'ko' },
      });
      if (existsByTitle) {
        throw new BadRequestException('이미 존재하는 제목입니다.');
      }
    } else {
      const existsByTitle = await DocumentTranslationEntity.findOne({
        where: {
          title,
          languageCode: 'ko',
          document: { id: Not(existingDocument.id) },
        },
      });
      if (existsByTitle) {
        throw new BadRequestException('이미 존재하는 제목입니다.');
      }
    }

    // 슬러그 중복 검증
    if (!existingDocument || slug !== existingDocument.slug) {
      const slugCondition = existingDocument
        ? { where: { slug, id: Not(existingDocument.id) } }
        : { where: { slug } };

      const existsBySlug = await DocumentEntity.exists(slugCondition);
      if (existsBySlug) {
        throw new BadRequestException('이미 존재하는 슬러그입니다.');
      }
    }

    return { title, content, slug, category };
  }
}
