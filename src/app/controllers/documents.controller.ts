import { Controller, Get } from '@nestjs/common';
import { EdgeView, View } from 'src/shared/edge-in-nest';

@Controller({ path: 'documents' })
export class DocumentsController {
  @Get()
  async index(@View() view: EdgeView) {
    return await view.render('pages/documents/index');
  }

  @Get('new')
  async new(@View() view: EdgeView) {
    return await view.render('pages/documents/new');
  }

  @Get(':id/edit')
  async edit(@View() view: EdgeView) {
    return await view.render('pages/documents/edit');
  }
}
