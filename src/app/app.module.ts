import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CookieResolver, I18nModule } from 'nestjs-i18n';
import { NestMvcCoreModule } from 'nestjs-mvc-tools';
import { join } from 'path';

import { ConfigModule } from '@nestjs/config';
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
import { TranslationService } from './services/translation.service';
import { CreateCategoryUseCase } from './use-cases/create-category.use-case';
import { CreateDocumentUseCase } from './use-cases/create-document.use-case';
import { UpdateCategoryUseCase } from './use-cases/update-category.use-case';
import { UpdateDocumentUseCase } from './use-cases/update-document.use-case';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: join(process.cwd(), `.env.${process.env.NODE_ENV}.local`),
      isGlobal: true,
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en', // 기본 언어
      loaderOptions: {
        path:
          process.env.NODE_ENV === 'development'
            ? join(process.cwd(), 'src', 'i18n')
            : join(process.cwd(), 'dist', 'i18n'),
        watch: process.env.NODE_ENV === 'development' || true,
      },
      resolvers: [
        { use: CookieResolver, options: ['language'] },
      ],
    }),
    NestMvcCoreModule.forRoot({
      debug: process.env.NODE_ENV === 'development',
      vite: {
        buildOutDir: join(process.cwd(), 'resources', 'public', 'builds'),
        developServerUrl: 'http://localhost:5173',
        mode:
          process.env.NODE_ENV === 'development' ? 'development' : 'production',
      },
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfig,
    }),
    TypeOrmModule.forFeature([
      CategoryEntity,
      CategoryTranslationEntity,
      DocumentEntity,
      DocumentTranslationEntity,
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
    CreateDocumentUseCase,
    CreateCategoryUseCase,
    UpdateDocumentUseCase,
    UpdateCategoryUseCase,
    CategoriesService,
    DocumentsService,
    TranslationService,
    { provide: APP_INTERCEPTOR, useClass: GlobalPageStatesInterceptor },
  ],
})
export class AppModule {}
