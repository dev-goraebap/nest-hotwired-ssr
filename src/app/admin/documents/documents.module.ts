import { Module } from '@nestjs/common';

import { AdminDocumentsController } from './documents.controller';
import { DocumentValidateService } from './services/document-validate.service';
import { AdminDocumentsService } from './services/documents.service';
import { CreateDocumentUseCase } from './use-cases/create-document.use-case';
import { UpdateDocumentUseCase } from './use-cases/update-document.use-case';

@Module({
  imports: [],
  controllers: [AdminDocumentsController],
  providers: [
    AdminDocumentsService,
    CreateDocumentUseCase,
    UpdateDocumentUseCase,
    DocumentValidateService,
  ],
})
export class AdminDocumentsModule {}
