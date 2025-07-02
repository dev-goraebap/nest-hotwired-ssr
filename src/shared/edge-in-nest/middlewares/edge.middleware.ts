import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import * as crypto from 'crypto';
import { Request, Response } from 'express';
import { EdgeView } from '../services/edge.view';

@Injectable()
export class EdgeMiddleware implements NestMiddleware {
  private readonly logger = new Logger(EdgeMiddleware.name);

  constructor(private readonly edgeView: EdgeView) {
    this.logger.debug('init EdgeJsMiddleware');
  }

  use(req: Request, res: Response, next: (error?: any) => void) {
    // 1. 세션에 CSRF 토큰이 없으면 생성
    if (!req.session) {
      throw new Error(
        'Session middleware must be registered before EdgeMiddleware',
      );
    }
    if (!req.session['csrfToken']) {
      req.session['csrfToken'] = crypto.randomBytes(32).toString('hex');
    }

    // 2. EdgeView에 csrfToken 전달 (템플릿에서 사용 가능)
    req['view'] = this.edgeView;
    req['csrfToken'] = req.session['csrfToken'];

    next();
  }
}
