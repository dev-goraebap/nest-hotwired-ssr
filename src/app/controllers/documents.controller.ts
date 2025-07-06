import {
  Controller,
  Get,
  Param
} from '@nestjs/common';

import { EdgeView, View } from 'nestjs-mvc-tools';

import { DocumentsService } from '../services/documents.service';

@Controller({ path: 'documents' })
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get(':slug')
  async show(@Param('slug') slug: string, @View() view: EdgeView) {
    const document = await this.documentsService.getBySlug(slug);
    return view.render('pages/documents/show', { document });
  }
}
