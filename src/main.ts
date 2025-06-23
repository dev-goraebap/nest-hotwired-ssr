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
    // 명시 안해도 기본값은 true
    // 사용자 입력이나 데이터베이스에서 가져온 값이 템플릿에 삽입될 때 HTML 특수 문자(<, >, &, ", ' 등)를 자동으로 이스케이프 처리
    // -> XSS 공격 방지
    autoescape: true,
    watch: true, // 템플릿 파일 변경 감지 활성화
    noCache: process.env.NODE_ENV !== 'production' // 개발 환경에서는 캐시 비활성화
  });
  app.setBaseViewsDir(views);
  app.setViewEngine('html');

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
