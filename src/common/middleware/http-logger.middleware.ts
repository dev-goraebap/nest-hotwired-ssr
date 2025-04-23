import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { createLogger } from '../logging/logger.util';

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  private logger = createLogger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { ip, method, originalUrl } = req;
    const userAgent = req.get('user-agent') || '';
    const startTime = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length') || 0;
      const responseTime = Date.now() - startTime;

      this.logger.info(`
      METHOD: ${method},
      ORIGINAL_URL: ${originalUrl},
      STATUS_CODE: ${statusCode},
      CONTENT_LENGTH: ${contentLength},
      RES_TIME: ${responseTime}ms,
      USER_AGENT: ${userAgent},
      IP: ${ip},  
      `);
    });

    next();
  }
}
