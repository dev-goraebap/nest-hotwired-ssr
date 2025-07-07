import { Module } from '@nestjs/common';
import { NestMvcCoreModule } from 'nestjs-mvc-tools';

import { AppController } from '../app.controller';
import { AppService } from '../app.service';
import { AdminController } from './controllers/admin.controller';
import { CategoriesController } from './controllers/admin/categories.controller';
import { DocumentsController as AdminDocumentsController } from './controllers/admin/documents.controller';
import { SessionsController } from './controllers/sessions.controller';

@Module({
  imports: [NestMvcCoreModule.forRoot({ debug: true })],
  controllers: [
    AppController,
    AdminController,
    AdminDocumentsController,
    CategoriesController,
    SessionsController
  ],
  providers: [AppService],
})
export class AppModule {}
