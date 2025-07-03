import { BadRequestException, Injectable } from '@nestjs/common';

import { CategoryEntity } from '../entities/category.entity';
import { DocumentEntity } from '../entities/document.entity';

@Injectable()
export class DocumentsService {
  index() {
    return DocumentEntity.find();
  }

  async create(dto: any) {
    const { title, content, slug, categoryId } = dto;

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
}
