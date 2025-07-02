import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';

export class CrsfProtectedInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CrsfProtectedInterceptor.name);

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const req: Request = context.switchToHttp().getRequest();
    const res: Response = context.switchToHttp().getResponse();

    // 작업 요청이 아니면 무시
    if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
      return next.handle();
    }

    this.logger.debug(JSON.stringify(req.body));
    const token = req.body?._csrf || req.headers['x-csrf-token'];
    this.logger.debug(JSON.stringify(token));

    // 작업요청에 crsf 토큰이 일치하지 않으면 403 처리 
    if (token !== req.session['csrfToken']) {
      this.logger.warn('Invalid CSRF token');
      throw new HttpException('Invalid CSRF token', HttpStatus.FORBIDDEN);
    }

    return next.handle();
  }
}
