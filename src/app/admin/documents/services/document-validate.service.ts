import { BadRequestException, Injectable } from '@nestjs/common';
import { DocumentEntity, DocumentTranslationEntity } from 'src/shared';
import { Not } from 'typeorm';
import { CreateDocumentDto } from '../dto/create-document.dto';
import { UpdateDocumentDto } from '../dto/update-document.dto';

@Injectable()
export class DocumentValidateService {
  async validate(
    dto: CreateDocumentDto | UpdateDocumentDto,
    existingDocument?: DocumentEntity,
  ) {
    const { title, slug } = dto;

    // 제목 중복 검증 (번역 테이블에서 한국어 기준으로)
    if (title !== undefined) {
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
    }

    // 슬러그 중복 검증
    if (slug !== undefined) {
      if (!existingDocument || slug !== existingDocument.slug) {
        const slugCondition = existingDocument
          ? { where: { slug, id: Not(existingDocument.id) } }
          : { where: { slug } };

        const existsBySlug = await DocumentEntity.exists(slugCondition);
        if (existsBySlug) {
          throw new BadRequestException('이미 존재하는 슬러그입니다.');
        }
      }
    }
  }
}
