import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class SsrExceptionFilter implements ExceptionFilter {
  async catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    const status = exception.getStatus();

    if (status === HttpStatus.FORBIDDEN) {
      return this.renderError(req, res, 'errors/403', 403, 'Forbidden');
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