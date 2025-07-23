import { Module } from '@nestjs/common';

import { TagsService } from './services/tags.service';
import { TagsController } from './controllers/tags.controller';

@Module({
  imports: [],
  controllers: [TagsController],
  providers: [TagsService],
})
export class TagsModule {}
