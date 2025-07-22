import { CategoryEntity } from '../entities';

export class SharedCategoriesService {
  async getSidebarCategories(languageCode: string = 'en') {
    return await CategoryEntity.find({
      relations: {
        translations: true,
        documents: {
          translations: true,
        },
      },
      where: {
        translations: {
          languageCode,
        },
        documents: {
          translations: {
            languageCode,
          },
        },
      },
      order: {
        order: 'ASC',
        createdAt: 'DESC',
        documents: {
          createdAt: 'ASC',
        },
      },
    });
  }
}
