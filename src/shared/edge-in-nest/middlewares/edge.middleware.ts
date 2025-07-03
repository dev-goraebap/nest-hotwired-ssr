import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { EdgeView } from '../services/edge.view';

@Injectable()
export class EdgeMiddleware implements NestMiddleware {
  private readonly logger = new Logger(EdgeMiddleware.name);

  constructor(private readonly edgeView: EdgeView) {
    this.logger.debug('init EdgeJsMiddleware');
  }

  use(req: Request, res: Response, next: (error?: any) => void) {
    // 2. EdgeView에 csrfToken 전달 (템플릿에서 사용 가능)

    req['view'] = this.edgeView;
    next();
  }
}
