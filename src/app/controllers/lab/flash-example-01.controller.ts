import { Controller, Get, Post, Res } from '@nestjs/common';
import { Response } from 'express';

import { DocumentsService } from 'src/app/services/documents.service';
import { EdgeView, View } from 'src/shared/edge-in-nest';

@Controller({ path: 'lab/flash-example-01' })
export class FlashExample01Controller {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  async index(@View() view: EdgeView) {
    const document = await this.documentsService.getBySlug(
      'lab/flash-example-01',
    );
    return await view.render('pages/lab/flash-example-01/index', { document });
  }

  @Post('success')
  doSuccess(@View() view: EdgeView, @Res() res: Response) {
    view.setFlash('notice', '작업이 성공적으로 완료되었습니다.');
    return res.redirect('/lab/flash-example-01');
  }

  @Post('failure')
  doFailure(@View() view: EdgeView, @Res() res: Response) {
    view.setFlash('alert', '작업 처리 중 오류가 발생했습니다.');
    return res.redirect('/lab/flash-example-01');
  }
}
