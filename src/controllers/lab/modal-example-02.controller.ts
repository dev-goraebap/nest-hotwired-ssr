import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { EdgeJsAdapter } from 'src/shared/edge-js';

@Controller({ path: 'lab/modal-example-02' })
export class ModalExample02Controller {
  @Get()
  index(@Res() res: Response) {
    return EdgeJsAdapter.render(res, 'page::lab/modal-example-02/index');
  }

  @Get('content')
  content(@Req() req: Request, @Res() res: Response) {
    const data = {
      title: 'hello world',
      content:
        'Ea mollit consectetur qui duis laborum irure. Sunt elit ex irure duis non irure irure aute aliquip consectetur elit commodo tempor. Duis eiusmod est nulla incididunt in excepteur ad eu ea exercitation.',
    };
    return EdgeJsAdapter.renderOnlyTurboRequest(
      req,
      res,
      'page::lab/modal-example-02/_content',
      data,
    );
  }

  @Get('lazy-content')
  async lazyContent(@Req() req: Request, @Res() res: Response) {
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(null);
      }, 1000);
    });
    return this.content(req, res);
  }

  @Get('close')
  close(@Res() res: Response) {
    const template = `<turbo-frame id="modalFrame"></turbo-frame>`;
    return res.send(template);
  }
}
