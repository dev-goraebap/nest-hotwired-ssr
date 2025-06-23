import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller({ path: 'lab' })
export class LabController {
  @Get()
  index(@Res() res: Response) {
    return res.render('lab/index');
  }
}
