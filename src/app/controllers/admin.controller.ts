import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from '../guards/auth.guard';

@Controller({ path: 'admin' })
@UseGuards(AuthGuard)
export class AdminController {
  @Get()
  async index(@Res() res: Response) {
    return res.redirect('admin/documents');
  }
}
