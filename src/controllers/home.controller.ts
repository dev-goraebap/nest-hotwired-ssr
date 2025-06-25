import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';

import { EdgeJsView, View } from 'src/shared/edge-js';

@Controller({ path: '' })
export class HomeController {
  @Get()
  async index(
    @View() view: EdgeJsView,
    @Res() res: Response,
    @Query('message') message?: string,
  ) {
    const template = await view.render('page::home/index', {
      message: message || 'hello world',
    });
    return res.send(template);
  }
}
