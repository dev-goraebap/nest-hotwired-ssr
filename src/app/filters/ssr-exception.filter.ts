import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class SsrExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    // 403 에러인 경우 커스텀 페이지 렌더링
    if (
      exception instanceof HttpException &&
      exception.getStatus() === HttpStatus.FORBIDDEN
    ) {
      // EdgeView가 req['view']에 있다고 가정
      if (req['view']) {
        req['view']
          .render('errors/403', {})
          .then((html: string) => res.status(403).send(html))
          .catch(() => res.status(403).send('Forbidden'));
      } else {
        res.status(403).send('Forbidden');
      }
      return;
    }

    if (
      exception instanceof HttpException &&
      exception.getStatus() === HttpStatus.NOT_FOUND
    ) {
      // EdgeView가 req['view']에 있다고 가정
      if (req['view']) {
        req['view']
          .render('pages/errors/404', {})
          .then((html: string) => res.status(404).send(html))
          .catch(() => res.status(404).send('Not Found'));
      } else {
        res.status(404).send('Not Found');
      }
      return;
    }

    // 그 외 에러는 기본 처리
    res.status(500).send('Internal Server Error');
  }
}
