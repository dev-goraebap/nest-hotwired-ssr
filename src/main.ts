import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

import { AppModule } from './app.module';
import { EdgeService } from './shared/edge-template-engine';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  await EdgeService.init();

  app.useStaticAssets(join(process.cwd(), 'resources', 'assets'), {
    prefix: '/public', // 외부 접근 경로는 public으로 설정 (별 이유없음)
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
