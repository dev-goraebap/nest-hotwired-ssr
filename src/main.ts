import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // EJS 템플릿 엔진 설정
  app.setViewEngine('ejs');
  app.setBaseViewsDir(join(process.cwd(), 'resources', 'views'));

  // 정적 파일 경로 설정
  app.useStaticAssets(join(process.cwd(), 'resources', 'public'), {
    prefix: '/public',
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
