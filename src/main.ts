import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as nunjucks from 'nunjucks';
import { join } from 'path';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  /**-------------------------------------------------------------------------
   * 템플릿 엔진 설정(모질라제단에서 만든 nunjucks 사용)
   *-------------------------------------------------------------------------*/
  const views = join(process.cwd(), 'resources', 'views');
  nunjucks.configure(views, { 
    express: app.getHttpAdapter().getInstance(),
    watch: true, // 템플릿 파일 변경 감지 활성화
  });
  app.setBaseViewsDir(views);
  app.setViewEngine('html');

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
