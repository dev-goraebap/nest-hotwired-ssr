import { BadRequestException, Injectable } from '@nestjs/common';
import { TagEntity } from 'src/shared';
import { Like } from 'typeorm';

@Injectable()
export class TagsService {
  async search(keyword: string) {
    return await TagEntity.find({
      where: {
        name: Like(`%${keyword}%`),
      },
      order: {
        name: 'ASC',
      },
      take: 10,
    });
  }

  async create(name: string, description: string = '') {
    const existTag = await TagEntity.exists({
      where: {
        name,
      },
    });
    if (existTag) {
      throw new BadRequestException('이미 사용중인 태그임');
    }

    const tag = TagEntity.create({
      name,
      description,
    });
    return await tag.save();
  }
}
