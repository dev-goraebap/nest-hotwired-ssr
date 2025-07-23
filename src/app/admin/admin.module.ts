import { Module } from '@nestjs/common';

import { AdminController } from './admin.controller';
import { AdminCategoriesModule } from './categories/categories.module';
import { AdminDocumentsModule } from './documents/documents.module';
import { PostsModule } from './posts/posts.module';
import { TagsModule } from './tags/tags.module';

@Module({
  imports: [
    AdminCategoriesModule,
    AdminDocumentsModule,
    PostsModule,
    TagsModule,
  ],
  controllers: [AdminController],
})
export class AdminModule {}
