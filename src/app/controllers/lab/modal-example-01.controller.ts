import { Controller, Get } from '@nestjs/common';

import { getMarkdownHtml } from 'src/app/helpers/markdown';
import { EdgeView, View } from 'src/shared/edge-in-nest';

@Controller({ path: 'lab/modal-example-01' })
export class ModalExample01Controller {
  @Get()
  async index(@View() view: EdgeView) {
    return await view.render('pages/lab/modal-example-01/index', {
      markdownHtml: getMarkdownHtml('lab/modal-example-01'),
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
