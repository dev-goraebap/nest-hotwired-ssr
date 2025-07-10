import { Injectable } from '@nestjs/common';
import { MvcNotFoundException, MvcValidationException } from 'nestjs-mvc-tools';
import { EntityManager, In } from 'typeorm';

import { CategoryTranslationEntity } from '../entities/category-translation.entity';
import { CategoryEntity } from '../entities/category.entity';

@Injectable()
export class AdminCategoriesService {
  constructor(private readonly entityManager: EntityManager) {}

  async getAll() {
    return await CategoryEntity.find({
      where: {
        translations: {
          languageCode: 'ko',
        },
      },
      relations: ['translations'],
      order: {
        order: 'asc',
        createdAt: 'desc',
      },
    });
  }

  async getById(id: number) {
    const result = await CategoryEntity.findOne({
      where: {
        id,
        translations: {
          languageCode: 'ko',
        },
      },
      relations: ['translations'],
    });
    if (!result) {
      throw new MvcNotFoundException('카테고리를 찾을 수 없습니다.');
    }
    return result;
  }

  async create(dto: any, manager?: EntityManager): Promise<CategoryEntity> {
    const em = manager || this.entityManager;

    // 유효성 검증
    await this.validateCreateData(dto);

    const category = em.create(CategoryEntity, {
      order: 1,
    });

    return await em.save(category);
  }

  async createTranslation(
    categoryId: number,
    languageCode: string,
    translationDto: { name: string; description: string },
    manager?: EntityManager,
  ): Promise<CategoryTranslationEntity> {
    const em = manager || this.entityManager;

    const translation = em.create(CategoryTranslationEntity, {
      category: { id: categoryId },
      languageCode,
      name: translationDto.name,
      description: translationDto.description,
    });

    return await em.save(translation);
  }

  async updateTranslation(
    categoryId: number,
    languageCode: string,
    translationDto: { name: string; description: string },
    manager?: EntityManager,
  ): Promise<CategoryTranslationEntity> {
    const em = manager || this.entityManager;

    let translation = await em.findOne(CategoryTranslationEntity, {
      where: { category: { id: categoryId }, languageCode },
    });

    if (!translation) {
      // 번역이 없으면 생성
      translation = em.create(CategoryTranslationEntity, {
        category: { id: categoryId },
        languageCode,
        name: translationDto.name,
        description: translationDto.description,
      });
    } else {
      // 기존 번역 업데이트
      Object.assign(translation, translationDto);
    }

    return await em.save(translation);
  }

  async updateOrders(idAndOrders: { id: number; order: number }[]) {
    const idAndOrderMap = new Map(
      idAndOrders.map(({ id, order }) => [id, order]),
    );
    const ids = Array.from(idAndOrderMap.keys());

    const categories = await CategoryEntity.find({
      where: { id: In(ids) },
    });

    const updated = categories.map((category) =>
      CategoryEntity.create({
        ...category,
        order: idAndOrderMap.get(category.id) ?? 0,
      }),
    );

    await CategoryEntity.save(updated);
  }

  async destroy(id: number) {
    const category = await CategoryEntity.findOne({ where: { id } });
    if (!category) {
      throw new MvcNotFoundException('카테고리를 찾을 수 없습니다.');
    }
    await CategoryEntity.remove(category);
  }

  // 유효성 검증 메서드들
  private async validateCreateData(dto: any) {
    const { name } = dto;

    if (!name) {
      throw new MvcValidationException('카테고리 이름을 입력해 주세요');
    }

    // 한국어 번역에서 중복 체크
    const existingTranslation = await CategoryTranslationEntity.findOne({
      where: { name, languageCode: 'ko' },
    });
    if (existingTranslation) {
      throw new MvcValidationException('중복된 이름입니다.');
    }
  }
}
