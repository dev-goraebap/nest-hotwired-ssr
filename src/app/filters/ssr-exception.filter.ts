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

    console.log(exception.message);

    const status = exception.getStatus();

    if (status === HttpStatus.BAD_REQUEST) {
      (req['view'] as EdgeView).setFlash('notice', exception.message);
      // referer가 있으면 referer로, 없으면 fallback 경로로 리다이렉트
      const redirectUrl = req.headers.referer || req.originalUrl || '/';
      return res.redirect(redirectUrl);
    }

    if (status === HttpStatus.FORBIDDEN) {
      return this.renderError(req, res, 'pages/errors/403', 403, 'Forbidden');
    }

    if (status === HttpStatus.NOT_FOUND) {
      return this.renderError(req, res, 'pages/errors/404', 404, 'Not Found');
    }

    // 기타 에러
    return this.renderError(req, res, 'pages/errors/500', 500, 'Not Found');
  }

  private async renderError(
    req: Request,
    res: Response,
    template: string,
    status: number,
    fallback: string,
  ) {
    if (req['view']) {
      try {
        const html = await req['view'].render(template, {});
        res.status(status).send(html);
      } catch {
        res.status(status).send(fallback);
      }
    } else {
      res.status(status).send(fallback);
    }
  }
}
