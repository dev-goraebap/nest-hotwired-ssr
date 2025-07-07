import { Module } from '@nestjs/common';
import { NestMvcCoreModule } from 'nestjs-mvc-tools';

import { AdminController } from './controllers/admin.controller';
import { CategoriesController } from './controllers/admin/categories.controller';
import { DocumentsController as AdminDocumentsController } from './controllers/admin/documents.controller';
import { HomeController } from './controllers/home.controller';
import { SessionsController } from './controllers/sessions.controller';

@Module({
  imports: [NestMvcCoreModule.forRoot({ debug: true })],
  controllers: [
    HomeController,
    AdminController,
    AdminDocumentsController,
    CategoriesController,
    SessionsController
  ],
  providers: [],
})
export class AppModule {}
