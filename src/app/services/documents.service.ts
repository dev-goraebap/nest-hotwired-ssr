import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

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
    const { title, content, slug, category: ctg } = dto;
    const categoryId = ctg?.id;
    if (!title) throw new BadRequestException('제목을 입력해 주세요.');
    if (!content) throw new BadRequestException('내용을 입력해 주세요.');
    if (!slug) throw new BadRequestException('슬러그를 만들어 주세요.');
    if (!categoryId) throw new BadRequestException('카테고리를 선택해 주세요.');

    const category = await CategoryEntity.findOne({
      where: { id: categoryId },
    });
    if (!category) {
      throw new BadRequestException('카테고리를 찾을 수 없습니다.');
    }

    const existsByTitle = await DocumentEntity.findOne({ where: { title } });
    if (existsByTitle) {
      throw new BadRequestException('이미 존재하는 제목입니다.');
    }

    const existsBySlug = await DocumentEntity.findOne({ where: { slug } });
    if (existsBySlug) {
      throw new BadRequestException('이미 존재하는 슬러그입니다.');
    }

    const document = DocumentEntity.create({
      title,
      content,
      slug,
      category,
    });
    await document.save();
  }

  async update(id: number, dto: any) {
    const { title, content, slug, category: ctg } = dto;
    const categoryId = ctg?.id;
    if (!title) throw new BadRequestException('제목을 입력해 주세요.');
    if (!content) throw new BadRequestException('내용을 입력해 주세요.');
    if (!slug) throw new BadRequestException('슬러그를 만들어 주세요.');
    if (!categoryId) throw new BadRequestException('카테고리를 선택해 주세요.');

    const category = await CategoryEntity.findOne({
      where: { id: categoryId },
    });
    if (!category) {
      throw new BadRequestException('카테고리를 찾을 수 없습니다.');
    }

    let document = await DocumentEntity.findOne({ where: { id } });
    if (!document) {
      throw new BadRequestException('문서를 찾을 수 없습니다.');
    }

    if (title !== document.title) {
      const hasTitle = await DocumentEntity.exists({ where: { title } });
      if (hasTitle) throw new BadRequestException('중복되는 제목 입니다');
    }

    if (slug !== document.slug) {
      const hasSlug = await DocumentEntity.exists({ where: { slug } });
      if (hasSlug) throw new BadRequestException('사용중인 슬러그 입니다');
    }

    document = DocumentEntity.create({
      ...document,
      title,
      content,
      slug,
      category: {
        id: categoryId,
      },
    });
    await document.save();
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
}
