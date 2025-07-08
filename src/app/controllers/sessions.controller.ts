import { Controller, Get, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { NestMvcView, View } from 'nestjs-mvc-tools';

@Controller({ path: 'sessions' })
export class SessionsController {
  @Get('/login')
  async login(@View() view: NestMvcView) {
    return view.render('pages/sessions/login', {});
  }

  @Post('/login')
  async doLogin(@Res() res: Response) {
    return res.redirect('/admins');
  }
}
