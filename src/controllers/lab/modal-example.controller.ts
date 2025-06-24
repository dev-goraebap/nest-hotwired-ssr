import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { EdgeService } from 'src/shared/edge-template-engine';

@Controller({ path: 'lab/modal-example' })
export class ModalExampleController {
  @Get()
  async index(@Res() res: Response) {
    const engine = EdgeService.getEngine();
    const template = await engine.render('page::lab/modal-example/index');
    return res.send(template);
  }

  @Get('content')
  async content(@Req() req: Request, @Res() res: Response) {
    const engine = EdgeService.getEngine();

    // turbo 비동기 요청이 아니면 404 페이지로 이동
    if (!req.headers['x-turbo-request-id']) {
      const template = await engine.render('page::errors/404');
      return res.send(template);
    }

    const template = await engine.render('uikit::modal/ssr');
    return res.send(template);
  }

  @Get('lazy-content')
  async lazyContent(@Req() req: Request, @Res() res: Response) {
    const engine = EdgeService.getEngine();

    // 데이터 처리가 1초 이상 걸린다고 가정
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve('');
      }, 1000);
    });

    // turbo 비동기 요청이 아니면 404 페이지로 이동
    if (!req.headers['x-turbo-request-id']) {
      const template = await engine.render('page::errors/404');
      return res.send(template);
    }

    const template = await engine.render('uikit::modal/ssr');
    return res.send(template);
  }
}
