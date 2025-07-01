import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';

import { EdgeView, View } from 'src/shared/edge-in-nest';

@Controller({ path: 'lab/file-upload-example-02' })
export class FileUploadExample02Controller {
  @Get()
  async index(@View() view: EdgeView, @Res() res: Response) {
    const template = await view.render('pages::lab/file-upload-example-02/index');
    return res.send(template);
  }
}
