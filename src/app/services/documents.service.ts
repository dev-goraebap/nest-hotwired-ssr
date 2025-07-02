import { BadRequestException, Injectable } from '@nestjs/common';
import { CategoryEntity } from '../entities/category.entity';
import { DocumentEntity } from '../entities/document.entity';

@Injectable()
export class DocumentsService {
  async create(dto: any) {
    const { title, content, categoryId } = dto;

    const category = await CategoryEntity.findOne({
      where: { id: categoryId },
    });
    if (!category) {
      throw new BadRequestException('카테고리를 찾을 수 없습니다.');
    }

    const document = DocumentEntity.create({
      title,
      content,
      category
    });
    await document.save();
  }
}
