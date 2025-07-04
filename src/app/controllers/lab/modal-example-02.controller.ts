import { Controller, Get } from '@nestjs/common';

import { DocumentsService } from 'src/app/services/documents.service';
import { EdgeView, View } from 'src/shared/edge-in-nest';

@Controller({ path: 'lab/modal-example-02' })
export class ModalExample02Controller {

  constructor(
    private readonly documentsService: DocumentsService
  ) {}

  @Get()
  async index(@View() view: EdgeView) {
    const document = await this.documentsService.getBySlug(
      '/lab/modal-example-02',
    );
    return await view.render('pages/lab/modal-example-02/index', { document });
  }

  @Get('content')
  async content(@View() view: EdgeView) {
    const data = {
      title: 'hello world',
      content:
        'Ea mollit consectetur qui duis laborum irure. Sunt elit ex irure duis non irure irure aute aliquip consectetur elit commodo tempor. Duis eiusmod est nulla incididunt in excepteur ad eu ea exercitation.',
    };
    return await view.renderOnlyTurboRequest(
      'pages/lab/modal-example-02/_content',
      data,
    );
  }

  @Get('lazy-content')
  async lazyContent(@View() view: EdgeView) {
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(null);
      }, 1000);
    });
    return this.content(view);
  }

  @Get('close')
  close() {
    return `<turbo-frame id="modalFrame"></turbo-frame>`;
  }
}
