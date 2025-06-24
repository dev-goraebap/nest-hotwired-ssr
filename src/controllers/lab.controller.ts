import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { EdgeJsAdapter } from 'src/shared/edge-js';

@Controller({ path: 'lab' })
export class LabController {
  @Get()
  index(@Res() res: Response) {
    return EdgeJsAdapter.render(res, 'page::lab/index');
  }
}
