import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { EdgeJsAdapter } from 'src/shared/edge-js';

@Controller({ path: '' })
export class HomeController {
  @Get()
  index(@Req() req: Request, @Res() res: Response, @Query('message') message?: string) {
    return EdgeJsAdapter.render(req, res, 'page::home/index', {
      message: message || 'hello world',
    });
  }
}
