import { Global, Module } from '@nestjs/common';

import { SharedCategoriesService } from './services';
import { TranslationService } from './services/translation.service';

@Global()
@Module({
  providers: [TranslationService, SharedCategoriesService],
  exports: [TranslationService, SharedCategoriesService],
})
export class SharedModule {}
