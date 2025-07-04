import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NestMiddleware,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { EdgeView } from '../services/edge.view';

@Injectable()
export class EdgeMiddleware implements NestMiddleware {
  private readonly logger = new Logger(EdgeMiddleware.name);

  constructor(private readonly edgeView: EdgeView) {
    this.logger.debug('init EdgeJsMiddleware');
  }

  use(req: Request, res: Response, next: (error?: any) => void) {
    // CSRF 토큰 검증 (POST, PUT, DELETE, PATCH 요청에 대해서만)
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
      const token = req.headers['x-csrf-token'];
      this.logger.debug(`CSRF Token from request: ${token}`);
      this.logger.debug(`CSRF Token from session: ${req.session['csrfToken']}`);

      if (!token || token !== req.session['csrfToken']) {
        this.logger.warn('Invalid CSRF token');
        // 미들웨어에서는 throw 대신 next()에 에러를 전달해야
        // NestJS의 Exception Filter가 이를 처리할 수 있습니다.
        return next(
          new HttpException('Invalid CSRF token', HttpStatus.FORBIDDEN),
        );
      }
    }

    // EdgeView 인스턴스를 요청 객체에 주입합니다.
    req['view'] = this.edgeView;
    next();
  }
}
