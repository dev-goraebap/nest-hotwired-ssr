import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { join } from 'path';

import {
  CategoryEntity,
  CategoryTranslationEntity,
  DocumentEntity,
  DocumentTranslationEntity,
  PostEntity,
  PostTranslationEntity,
  SeriesEntity,
  SeriesTranslationEntity,
  TagEntity,
  TagTranslationEntity,
} from 'src/shared';

@Injectable()
export class TypeOrmOptionsImpl implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): Promise<TypeOrmModuleOptions> | TypeOrmModuleOptions {
    return {
      type: 'sqlite',
      database: join(process.cwd(), 'storage', 'development.sqlite'),
      synchronize: process.env.NODE_ENV === 'development' ? true : false,
      logger: 'debug',
      logging: true,
      entities: [
        CategoryEntity,
        CategoryTranslationEntity,
        DocumentEntity,
        DocumentTranslationEntity,
        PostEntity,
        PostTranslationEntity,
        TagEntity,
        TagTranslationEntity,
        SeriesEntity,
        SeriesTranslationEntity,
      ],
    };
  }
}
