import { Controller, Get } from '@nestjs/common';

import { getMarkdownHtml } from 'src/app/helpers/markdown';
import { DocumentsService } from 'src/app/services/documents.service';
import { EdgeView, View } from 'nestjs-mvc-tools';

@Controller({ path: 'lab/modal-example-01' })
export class ModalExample01Controller {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  async index(@View() view: EdgeView) {
    const document = await this.documentsService.getBySlug(
      'lab/modal-example-01',
    );
    return await view.render('pages/lab/modal-example-01/index', {
      document,
    });
  }

  @Get('content')
  content() {
    const data = {
      title: 'hello world',
      content:
        'Ea mollit consectetur qui duis laborum irure. Sunt elit ex irure duis non irure irure aute aliquip consectetur elit commodo tempor. Duis eiusmod est nulla incididunt in excepteur ad eu ea exercitation.',
    };
    return data;
  }
}
