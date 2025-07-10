import { CategoryEntity } from '../entities/category.entity';

export class CategoriesService {
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
      .orderBy('category.order', 'ASC')
      .addOrderBy('category.createdAt', 'DESC')
      .addOrderBy('document.createdAt', 'ASC')
      .getMany();
    return results;
  }
}
