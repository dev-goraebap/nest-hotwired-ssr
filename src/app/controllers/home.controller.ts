import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { NestMvcView, View } from 'nestjs-mvc-tools';

@Controller()
export class HomeController {
  constructor(private readonly i18n: I18nService) {}

  @Get()
  async index(@Res() res: Response) {
    // const i18nContext = I18nContext.current();
    // const lang = i18nContext?.lang;
    // const i18nContent = this.i18n.translate('pages.home', { lang });
    // return view.render('pages/home', { i18nContent });
    return res.redirect('/documents/start-with-setup');
  }
}
