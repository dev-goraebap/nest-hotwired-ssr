import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { EdgeJsAdapter } from 'src/shared/edge-js';

@Controller({ path: 'lab/modal-example-01' })
export class ModalExample01Controller {
  @Get()
  index(@Res() res: Response) {
    return EdgeJsAdapter.render(res, 'page::lab/modal-example-01/index');
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
