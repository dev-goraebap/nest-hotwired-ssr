import { Module } from '@nestjs/common';

import { AdminController } from './admin.controller';
import { AdminCategoriesModule } from './categories/categories.module';
import { AdminDocumentsModule } from './documents/documents.module';

@Module({
  imports: [
    AdminCategoriesModule,
    AdminDocumentsModule,
  ],
  controllers: [
    AdminController
  ]
})
export class AdminModule {}
