import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { EdgeView, View } from 'src/shared/edge-in-nest';

@Controller({ path: 'documents' })
export class DocumentsController {
  @Get()
  async index(@View() view: EdgeView, @Res() res: Response) {
    const template = await view.render('pages/documents/index');
    return res.send(template);
  }

  @Get('new')
  async new(@View() view: EdgeView, @Res() res: Response) {
    const template = await view.render('pages/documents/new');
    return res.send(template);
  }

  @Get(':id/edit')
  async edit(@View() view: EdgeView, @Res() res: Response) {
    const template = await view.render('pages/documents/edit');
    return res.send(template);
  }
}
