import { Controller, Get, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { EdgeJsView, View } from 'src/shared/edge-js';

@Controller({ path: 'lab/flash-example-02' })
export class FlashExample02Controller {
  @Get()
  async index(@View() view: EdgeJsView, @Res() res: Response) {
    const template = await view.render('pages::lab/flash-example-02/index');
    return res.send(template);
  }

  @Post('success')
  doSuccess(@View() view: EdgeJsView, @Res() res: Response) {
    view.setFlash('notice', '작업이 성공적으로 완료되었습니다.');
    return res.redirect('/lab/flash-example-02');
  }

  @Post('failure')
  doFailure(@View() view: EdgeJsView, @Res() res: Response) {
    view.setFlash('alert', '작업 처리 중 오류가 발생했습니다.');
    return res.redirect('/lab/flash-example-02');
  }
}
