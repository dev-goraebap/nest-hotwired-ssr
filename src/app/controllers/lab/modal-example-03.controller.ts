import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';

import { EdgeView, View } from 'src/shared/edge-in-nest';

@Controller({ path: 'lab/modal-example-03' })
export class ModalExample03Controller {
  @Get()
  async index(@View() view: EdgeView, @Res() res: Response) {
    const template = await view.render('pages/lab/modal-example-03/index');
    return res.send(template);
  }

  @Get('content')
  async content(@View() view: EdgeView, @Res() res: Response) {
    const data = {
      title: 'hello world',
      content:
        'Ea mollit consectetur qui duis laborum irure. Sunt elit ex irure duis non irure irure aute aliquip consectetur elit commodo tempor. Duis eiusmod est nulla incididunt in excepteur ad eu ea exercitation.',
    };
    const template = await view.renderOnlyTurboRequest(
      'pages/lab/modal-example-03/_content',
      data,
    );
    return res.send(template);
  }

  @Get('lazy-content')
  async lazyContent(@View() view: EdgeView, @Res() res: Response) {
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(null);
      }, 1000);
    });
    return this.content(view, res);
  }
}
