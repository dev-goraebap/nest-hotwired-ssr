import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { EdgeJsAdapter } from 'src/shared/edge-js';

@Controller({ path: 'lab/flash-example-01' })
export class FlashExample01Controller {
  @Get()
  index(@Req() req: Request, @Res() res: Response) {
    // 세션에서 notice나 alert 메시지가 있으면
    // 뭔가 edge.js 의 글로벌 상태에 값 넣어줄 수 있나 ..?
    // 페이지에서는 그걸로 플래시 메시지 단발성으로 보여줄라고
    return EdgeJsAdapter.render(req, res, 'page::lab/flash-example-01/index');
  }

  @Post('success')
  doSuccess(@Req() req: Request, @Res() res: Response) {
    EdgeJsAdapter.setFlash(req, 'notice', '작업이 성공적으로 완료되었습니다.');
    return res.redirect('/lab/flash-example-01');
  }

  @Post('failure')
  doFailure(@Req() req: Request, @Res() res: Response) {
    EdgeJsAdapter.setFlash(req, 'alert', '작업 처리 중 오류가 발생했습니다.');
    return res.redirect('/lab/flash-example-01');
  }
}
