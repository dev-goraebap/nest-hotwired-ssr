import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller({ path: 'admin' })
export class AdminController {
  @Get()
  async index(@Res() res: Response) {
    // todo: 로그인 상태가 아니면 로그인페이지로 리다이랙트 하는 로직추가
    return res.redirect('admin/documents');
  }
}
