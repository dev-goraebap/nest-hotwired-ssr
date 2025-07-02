import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';

import { EdgeView, View } from 'src/shared/edge-in-nest';

@Controller({ path: 'lab/modal-example-01' })
export class ModalExample01Controller {
  @Get()
  async index(@View() view: EdgeView, @Res() res: Response) {
    const template = await view.render('pages/lab/modal-example-01/index');
    return res.send(template);
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
