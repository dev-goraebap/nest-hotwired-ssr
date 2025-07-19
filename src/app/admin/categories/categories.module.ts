import { Module } from '@nestjs/common';

import { AdminCategoriesController } from './categories.controller';
import { AdminCategoriesService } from './categories.service';
import { CreateCategoryUseCase } from './use-cases/create-category.use-case';
import { UpdateCategoryUseCase } from './use-cases/update-category.use-case';

@Module({
  controllers: [
    AdminCategoriesController
  ],
  imports: [],
  providers: [
    AdminCategoriesService,
    CreateCategoryUseCase,
    UpdateCategoryUseCase
  ],
})
export class AdminCategoriesModule {}
