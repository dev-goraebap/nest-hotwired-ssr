import { MvcNotFoundException, MvcValidationException } from 'nestjs-mvc-tools';
import { In } from 'typeorm';

import { CategoryEntity } from '../entities/category.entity';

export class CategoriesService {
  async index() {
    return await CategoryEntity.find({
      order: {
        rank: 'asc',
        createdAt: 'desc',
      },
    });
  }

  async getSidebarCategories() {
    const results = await CategoryEntity.createQueryBuilder('category')
      .leftJoinAndSelect('category.documents', 'document')
      .select([
        'category.id',
        'category.name',
        'document.id',
        'document.title',
        'document.slug',
      ])
      .orderBy('category.rank', 'ASC')
      .addOrderBy('category.createdAt', 'DESC')
      .addOrderBy('document.createdAt', 'ASC')
      .getMany();
    return results;
  }

  async create(dto: any) {
    const { name, description } = dto;

    if (!name) {
      throw new MvcValidationException(
        '카테고리 이름을 입력해 주세요',
        '/admin/categories/new',
      );
    }

    let category = await CategoryEntity.findOne({ where: { name } });
    if (category) {
      throw new MvcValidationException(
        '중복된 이름입니다.',
        '/admin/categories/new',
      );
    }

    category = CategoryEntity.create({
      name,
      description,
      rank: 0,
    });
    await category.save();
  }

  async update(id: number, name: string, description: string) {
    let category = await CategoryEntity.findOne({ where: { id } });
    if (!category) {
      throw new MvcValidationException('카테고리를 찾을 수 없습니다.');
    }

    category = CategoryEntity.create({ ...category, name, description });
    await category.save();
  }

  async updateRanks(idAndRanks: { id: number; rank: number }[]) {
    const idToRank = new Map(idAndRanks.map(({ id, rank }) => [id, rank]));
    const ids = Array.from(idToRank.keys());

    const categories = await CategoryEntity.find({
      where: { id: In(ids) },
    });

    const updated = categories.map((category) =>
      CategoryEntity.create({
        ...category,
        rank: idToRank.get(category.id) ?? 0,
      }),
    );

    await CategoryEntity.save(updated);
  }

  async destroy(id: number) {
    let category = await CategoryEntity.findOne({ where: { id } });
    if (!category) {
      throw new MvcNotFoundException('카테고리를 찾을 수 없습니다.');
    }
    await CategoryEntity.remove(category);
  }
}
