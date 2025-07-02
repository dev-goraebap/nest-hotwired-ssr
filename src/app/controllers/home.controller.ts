import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';

import { EdgeView, View } from 'src/shared/edge-in-nest';
import { getMarkdownHtml } from '../helpers/markdown';

@Controller({ path: '' })
export class HomeController {
  @Get()
  async index(
    @View() view: EdgeView,
    @Res() res: Response,
    @Query('message') message?: string,
  ) {
    const markdownHtml = getMarkdownHtml('home');
    const template = await view.render('pages/home/index', {
      message: message || 'hello world',
      markdownHtml,
    });
    return res.send(template);
  }
}
