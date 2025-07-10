import { Controller, Get, Param } from '@nestjs/common';
import { NestMvcView, View } from 'nestjs-mvc-tools';
import { DocumentsService } from '../services/documents.service';

@Controller({ path: 'documents' })
export class DocumentsControllers {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get(':slug')
  async show(@Param('slug') slug: string, @View() view: NestMvcView) {
    const document = await this.documentsService.getBySlug(slug);
    return view.render('pages/documents/show', { document });
  }
}
