import { Controller, Get, Query } from '@nestjs/common';

import { EdgeView, View } from 'src/shared/edge-in-nest';

import { getMarkdownHtml } from '../helpers/markdown';

@Controller({ path: '' })
export class HomeController {
  @Get()
  async index(
    @View() view: EdgeView,
    @Query('message') message?: string,
  ) {
    const markdownHtml = getMarkdownHtml('home');
    return await view.render('pages/home/index', {
      message: message || 'hello world',
      markdownHtml,
    });
  }
}
