import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { EdgeView } from 'src/shared/edge-in-nest';

@Catch(HttpException)
export class SsrExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(SsrExceptionFilter.name);

  async catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    const status = exception.getStatus();

    this.logger.warn(exception);

    if (req.originalUrl?.startsWith('/.well-known/')) {
      return;
    }

    if (status === HttpStatus.BAD_REQUEST) {
      (req['view'] as EdgeView).setFlash('alert', exception.message, req.body);
      // referer가 있으면 referer로, 없으면 fallback 경로로 리다이렉트
      const redirectUrl = req.headers.referer || req.originalUrl || '/';
      return res.redirect(303, redirectUrl);
    }

    if (status === HttpStatus.FORBIDDEN) {
      return res.redirect(303, '/403');
    }

    if (status === HttpStatus.NOT_FOUND) {
      return res.redirect(303, '/404');
    }

    // 기타 에러
    return res.redirect(303, '/500');
  }
}
