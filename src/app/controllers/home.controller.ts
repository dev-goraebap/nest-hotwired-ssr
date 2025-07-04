import { Controller, Get, Query } from '@nestjs/common';

import { EdgeView, View } from 'src/shared/edge-in-nest';
import { getMarkdownHtml } from '../helpers/markdown';

@Controller({ path: '' })
export class HomeController {
  @Get()
  async index(@View() view: EdgeView, @Query('message') message?: string) {
    const markdownHtml = getMarkdownHtml('README');
    return await view.render('pages/home/index', {
      markdownHtml,
    });
  }
}
