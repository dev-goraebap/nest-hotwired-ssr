import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller({ path: 'admin' })
export class AdminController {
  @Get()
  index(@Res() res: Response) {
    return res.redirect('/admin/documents');
  }
}
