import { Controller, Get, Post, Res } from '@nestjs/common';
import { Response } from 'express';

import { EdgeView, View } from 'src/shared/edge-in-nest';

@Controller({ path: 'lab/flash-example-01' })
export class FlashExample01Controller {
  @Get()
  async index(@View() view: EdgeView, @Res() res: Response) {
    const template = await view.render('pages::lab/flash-example-01/index');
    return res.send(template);
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
