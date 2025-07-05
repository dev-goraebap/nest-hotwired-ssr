import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Not } from 'typeorm';
import { CategoryEntity } from '../entities/category.entity';
import { DocumentEntity } from '../entities/document.entity';

@Injectable()
export class DocumentsService {
  index() {
    return DocumentEntity.find({
      relations: {
        category: true,
      },
    });
  }

  async getById(id: number) {
    const result = await DocumentEntity.findOne({
      where: { id },
      relations: {
        category: true,
      },
    });
    if (!result) {
      throw new NotFoundException('게시물을 찾을 수 없습니다.');
    }
    return result;
  }

  async getBySlug(slug: string) {
    const result = await DocumentEntity.findOne({
      where: { slug },
    });
    if (!result) {
      throw new NotFoundException('게시물을 찾을 수 없습니다.');
    }
    return result;
  }

  async create(dto: any) {
    const { title, content, slug, category } =
      await this.validateAndPrepareData(dto);

    const document = DocumentEntity.create({
      title,
      content,
      slug,
      category,
    });

    await document.save();
    return document;
  }

  async update(id: number, dto: any) {
    const document = await DocumentEntity.findOne({ where: { id } });
    if (!document) {
      throw new BadRequestException('문서를 찾을 수 없습니다.');
    }

    const { title, content, slug, category } =
      await this.validateAndPrepareData(dto, document);

    // 문서 업데이트
    Object.assign(document, { title, content, slug, category });
    await document.save();

    return document;
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
      throw new BadRequestException('카테고리를 찾을 수 없습니다.');
    }

    // 제목 중복 검증
    if (!existingDocument || title !== existingDocument.title) {
      const titleCondition = existingDocument
        ? { where: { title, id: Not(existingDocument.id) } }
        : { where: { title } };

      const existsByTitle = await DocumentEntity.exists(titleCondition);
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
