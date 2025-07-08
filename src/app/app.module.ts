import { Module } from '@nestjs/common';
import { NestMvcCoreModule } from 'nestjs-mvc-tools';

import { APP_INTERCEPTOR } from '@nestjs/core';
import { HeaderResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import { join } from 'path';
import { AdminController } from './controllers/admin.controller';
import { CategoriesController } from './controllers/admin/categories.controller';
import { DocumentsController as AdminDocumentsController } from './controllers/admin/documents.controller';
import { HomeController } from './controllers/home.controller';
import { SessionsController } from './controllers/sessions.controller';
import { GlobalPageStatesInterceptor } from './interceptors/global-page-states.interceptor';

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
  ],
  controllers: [
    HomeController,
    AdminController,
    AdminDocumentsController,
    CategoriesController,
    SessionsController,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: GlobalPageStatesInterceptor },
  ],
})
export class AppModule {}
