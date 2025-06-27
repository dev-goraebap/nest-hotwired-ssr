import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import { join } from 'path';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Gzip 압축 활성화
  app.use(compression());

  // 쿠키 파서 미들웨어 설정
  app.use(cookieParser());

  app.use(
    session({
      secret: 'hello-world',
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 60000 },
    }),
  );

  // 정적 애셋 설정 (캐시 헤더 포함)
  const cacheTime = {
    oneYear: 31536000, // 1년 (초)
    oneMonth: 2592000, // 30일 (초)
    oneWeek: 604800, // 1주일 (초)
  };

  app.useStaticAssets(join(process.cwd(), 'resources', 'assets'), {
    prefix: '/public',
    maxAge: cacheTime.oneYear * 1000, // 밀리초로 변환
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
      // 파일 확장자별 캐시 정책
      if (
        path.endsWith('.ttf') ||
        path.endsWith('.woff') ||
        path.endsWith('.woff2')
      ) {
        // 폰트 파일: 1년
        res.setHeader(
          'Cache-Control',
          `public, max-age=${cacheTime.oneYear}, immutable`,
        );
      } else if (path.endsWith('.js') || path.endsWith('.css')) {
        // JS/CSS 파일: 1년 (빌드 시 해시가 포함되므로)
        res.setHeader(
          'Cache-Control',
          `public, max-age=${cacheTime.oneYear}, immutable`,
        );
      } else if (
        path.endsWith('.jpg') ||
        path.endsWith('.jpeg') ||
        path.endsWith('.png') ||
        path.endsWith('.gif') ||
        path.endsWith('.svg')
      ) {
        // 이미지 파일: 30일
        res.setHeader('Cache-Control', `public, max-age=${cacheTime.oneMonth}`);
      } else {
        // 기타 파일: 1주일
        res.setHeader('Cache-Control', `public, max-age=${cacheTime.oneWeek}`);
      }
    },
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
