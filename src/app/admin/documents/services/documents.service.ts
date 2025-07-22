import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';

import {
  CategoryEntity,
  DocumentEntity,
  DocumentTranslationEntity,
} from 'src/shared';
import { CreateDocumentDto } from '../dto/create-document.dto';

@Injectable()
export class AdminDocumentsService {
  constructor(private readonly dataSource: DataSource) {}

  index() {
    return this.dataSource.manager.find(DocumentEntity, {
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
    const result = await this.dataSource.manager.findOne(DocumentEntity, {
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

  async create(
    manager: EntityManager,
    category: CategoryEntity,
    dto: CreateDocumentDto,
  ): Promise<DocumentEntity> {
    const document = manager.create(DocumentEntity, {
      slug: dto.slug,
      category,
    });

    return await manager.save(document);
  }

  async createTranslation(
    manager: EntityManager,
    document: DocumentEntity,
    languageCode: string,
    translationDto: { title: string; content: string },
  ): Promise<DocumentTranslationEntity> {
    const translation = manager.create(DocumentTranslationEntity, {
      document,
      languageCode,
      title: translationDto.title,
      content: translationDto.content,
    });

    return await manager.save(translation);
  }

  async update(
    manager: EntityManager,
    id: number,
    dto: any,
  ): Promise<DocumentEntity> {
    const document = await manager.findOne(DocumentEntity, { where: { id } });
    if (!document) {
      throw new BadRequestException('문서를 찾을 수 없습니다.');
    }
    // 문서 기본 정보 업데이트 (slug, category)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    Object.assign(document, { slug: dto.slug, category: dto.category });
    await manager.save(document);

    return document;
  }

  async updateTranslation(
    manager: EntityManager,
    documentId: number,
    languageCode: string,
    translationDto: { title: string; content: string },
  ): Promise<DocumentTranslationEntity> {
    let translation = await manager.findOne(DocumentTranslationEntity, {
      where: { document: { id: documentId }, languageCode },
    });

    if (!translation) {
      // 번역이 없으면 생성
      translation = manager.create(DocumentTranslationEntity, {
        document: { id: documentId },
        languageCode,
        title: translationDto.title,
        content: translationDto.content,
      });
    } else {
      // 기존 번역 업데이트
      Object.assign(translation, translationDto);
    }

    return await manager.save(translation);
  }

  async destroy(id: number) {
    const document = await this.dataSource.manager.findOne(DocumentEntity, {
      where: { id },
    });
    if (!document) {
      throw new BadRequestException('문서를 찾을 수 없습니다.');
    }
    await this.dataSource.manager.remove(document);
  }
}
