import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

import * as session from 'express-session';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(
    session({
      secret: 'hello-world',
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 60000 }
    }),
  );

  app.useStaticAssets(join(process.cwd(), 'resources', 'assets'), {
    prefix: '/public', // 외부 접근 경로는 public으로 설정 (별 이유없음)
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
