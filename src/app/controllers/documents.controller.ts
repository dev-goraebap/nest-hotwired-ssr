import { Controller, Get, Param } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';
import { NestMvcView, View } from 'nestjs-mvc-tools';

import { DocumentsService } from '../services/documents.service';

@Controller({ path: 'documents' })
export class DocumentsControllers {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get(':slug')
  async show(@Param('slug') slug: string, @View() view: NestMvcView) {
    const i18nContext = I18nContext.current();
    const lang = i18nContext?.lang;
    const document = await this.documentsService.getBySlug(slug, lang);
    return view.render('pages/documents/show', { document });
  }
}
