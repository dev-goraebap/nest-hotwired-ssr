import { Controller, Get, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { EdgeView, View } from 'nestjs-mvc-tools';

@Controller({ path: 'sessions' })
export class SessionsController {
  @Get('/login')
  async login(@View() view: EdgeView) {
    return view.render('pages/sessions/login', {});
  }

  @Post('/login')
  async doLogin(@Res() res: Response) {
    return res.redirect('/admins');
  }
}
