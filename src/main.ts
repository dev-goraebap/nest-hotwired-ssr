import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { WinstonModule } from 'nest-winston';
import { join } from 'path';

import { AppModule } from './app.module';
import { winstonConfig } from './common/logging/winston.config';

async function bootstrap() {
  // 윈스턴 로거 인스턴스 생성
  const logger = WinstonModule.createLogger(winstonConfig);

  // 앱 생성 시 로거 주입
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger,
  });

  app.set('trust proxy', true);

  // EJS 템플릿 엔진 설정
  app.setViewEngine('ejs');
  app.setBaseViewsDir(join(process.cwd(), 'resources', 'views'));

  // 정적 파일 경로 설정
  app.useStaticAssets(join(process.cwd(), 'resources', 'public'), {
    prefix: '/public',
  });

  await app.listen(process.env.PORT ?? 3000);

  logger.log(`Application is running on: ${await app.getUrl()}`, 'Bootstrap');
}
bootstrap();
