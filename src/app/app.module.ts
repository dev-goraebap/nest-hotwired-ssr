import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HeaderResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import { NestMvcCoreModule } from 'nestjs-mvc-tools';
import { join } from 'path';

import { TypeOrmConfig } from 'src/config/typeorm.config';
import { AdminCategoriesController } from './controllers/admin.categories.controller';
import { AdminController } from './controllers/admin.controller';
import { AdminDocumentsController } from './controllers/admin.documents.controller';
import { DocumentsControllers } from './controllers/documents.controller';
import { HomeController } from './controllers/home.controller';
import { SessionsController } from './controllers/sessions.controller';
import { CategoryTranslationEntity } from './entities/category-translation.entity';
import { CategoryEntity } from './entities/category.entity';
import { DocumentTranslationEntity } from './entities/document-translation.entity';
import { DocumentEntity } from './entities/document.entity';
import { GlobalPageStatesInterceptor } from './interceptors/global-page-states.interceptor';
import { AdminCategoriesService } from './services/admin.categories.service';
import { AdminDocumentsService } from './services/admin.documents.service';
import { CategoriesService } from './services/categories.service';
import { DocumentsService } from './services/documents.service';

@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: 'ko', // 기본 언어
      loaderOptions: {
        path: join(process.cwd(), 'src', 'i18n'),
        watch: process.env.NODE_ENV === 'development' || true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] }, // ?lang=ko
        { use: HeaderResolver, options: ['x-custom-lang'] },
      ],
    }),
    NestMvcCoreModule.forRoot({
      debug: true,
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfig,
    }),
    TypeOrmModule.forFeature([
      CategoryEntity,
      CategoryTranslationEntity,
      DocumentEntity, 
      DocumentTranslationEntity
    ]),
  ],
  controllers: [
    HomeController,
    DocumentsControllers,
    AdminController,
    AdminDocumentsController,
    AdminCategoriesController,
    SessionsController,
  ],
  providers: [
    AdminCategoriesService,
    AdminDocumentsService,
    CategoriesService,
    DocumentsService,
    { provide: APP_INTERCEPTOR, useClass: GlobalPageStatesInterceptor },
  ],
})
export class AppModule {}
