import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';

import { EdgeView, View } from 'src/shared/edge-in-nest';

@Controller({ path: '' })
export class HomeController {
  @Get()
  async index(
    @View() view: EdgeView,
    @Res() res: Response,
    @Query('message') message?: string,
  ) {
    const template = await view.render('pages::home/index', {
      message: message || 'hello world',
    });
    return res.send(template);
  }
}
