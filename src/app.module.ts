import { MiddlewareConsumer, Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';

import { AdminModule } from './admin';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { winstonConfig } from './common/logging/winston.config';
import { HttpLoggerMiddleware } from './common/middleware/http-logger.middleware';
import { DatabaseModule } from './database';

@Module({
  imports: [WinstonModule.forRoot(winstonConfig), DatabaseModule, AdminModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    // 모든 요청에 HTTP 로깅 미들웨어 적용
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}
