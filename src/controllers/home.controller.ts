import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { EdgeService } from 'src/shared/edge-template-engine';

@Controller({ path: '' })
export class HomeController {
  @Get()
  async index(@Res() res: Response, @Query('message') message?: string) {
    const engine = EdgeService.getEngine();
    const template = await engine.render('page::home/index', {
      message: message || 'hello world',
    });
    return res.send(template);
  }
}
