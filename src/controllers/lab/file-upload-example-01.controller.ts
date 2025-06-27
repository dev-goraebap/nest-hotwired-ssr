import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { Response } from 'express';

import { EdgeJsView, View } from 'src/shared/edge-js';

@Controller({ path: 'lab/file-upload-example-01' })
export class FileUploadExampleController {
  @Get()
  async index(@View() view: EdgeJsView, @Res() res: Response) {
    const template = await view.render(
      'page::lab/file-upload-example-01/index',
    );
    return res.send(template);
  }

  @Post()
  async create(@View() view: EdgeJsView, @Res() res: Response) {
    console.log('요청옴');
    view.setFlash('notice', '아무것도 하지 않았지만 일단 성공!');
    return res.redirect('/lab/file-upload-example-01');
  }
}
