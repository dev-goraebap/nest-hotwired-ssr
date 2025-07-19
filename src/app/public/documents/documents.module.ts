import { Module } from '@nestjs/common';
import { PublicDocumentsController } from './documents.controller';
import { PublicDocumentsService } from './documents.service';

@Module({
  imports: [],
  controllers: [PublicDocumentsController],
  providers: [PublicDocumentsService],
})
export class PublicDocumentsModule {}
