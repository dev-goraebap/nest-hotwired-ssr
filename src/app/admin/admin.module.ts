import { Module } from '@nestjs/common';

import { AdminController } from './admin.controller';
import { AdminCategoriesModule } from './categories/categories.module';
import { AdminDocumentsModule } from './documents/documents.module';
import { PostsModule } from './posts/posts.module';

@Module({
  imports: [AdminCategoriesModule, AdminDocumentsModule, PostsModule],
  controllers: [AdminController],
})
export class AdminModule {}
