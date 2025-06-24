import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { EdgeJsAdapter } from 'src/shared/edge-js';

@Controller({ path: '' })
export class HomeController {
  @Get()
  index(@Res() res: Response, @Query('message') message?: string) {
    return EdgeJsAdapter.render(res, 'page::home/index', {
      message: message || 'hello world',
    });
  }
}
