import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // EJS 템플릿 엔진 설정
  app.setViewEngine('ejs');
  app.setBaseViewsDir(join(process.cwd(), 'resources', 'views'));

  // 정적 파일 경로 설정
  app.useStaticAssets(join(process.cwd(), 'resources', 'js'), {
    prefix: '/js',
  });
  app.useStaticAssets(join(process.cwd(), 'resources', 'css'), {
    prefix: '/css',
  });
  app.useStaticAssets(join(process.cwd(), 'resources', 'imgs'), {
    prefix: '/imgs',
  });
  app.useStaticAssets(join(process.cwd(), 'resources', 'fonts'), {
    prefix: '/fonts',
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
