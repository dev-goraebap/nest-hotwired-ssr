import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { EdgeJsAdapter } from 'src/shared/edge-js';

@Controller({ path: 'lab/modal-example' })
export class ModalExampleController {
  @Get()
  index(@Res() res: Response) {
    return EdgeJsAdapter.render(res, 'page::lab/modal-example/index');
  }

  @Get('content')
  content(@Req() req: Request, @Res() res: Response) {
    // turbo 비동기 요청이 아니면 404 페이지로 이동
    if (!req.headers['x-turbo-request-id']) {
      return EdgeJsAdapter.render(res, 'page::errors/404');
    }

    return EdgeJsAdapter.render(res, 'uikit::modal/ssr');
  }

  @Get('lazy-content')
  async lazyContent(@Req() req: Request, @Res() res: Response) {
    // 데이터 처리가 1초 이상 걸린다고 가정
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve('');
      }, 1000);
    });

    // turbo 비동기 요청이 아니면 404 페이지로 이동
    if (!req.headers['x-turbo-request-id']) {
      return EdgeJsAdapter.render(res, 'page::errors/404');
    }

    return EdgeJsAdapter.render(res, 'uikit::modal/ssr');
  }
}
