import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as session from 'express-session';
import { join } from 'path';

import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Gzip 압축 활성화
  app.use(compression());

  // .well-known 경로에 대한 요청 처리 (크롬 개발자 도구 관련)
  app.use((req, res, next) => {
    if (req.url.startsWith('/.well-known')) {
      return res.status(204).send();
    }
    next();
  });

  // 쿠키 파서 미들웨어 설정
  app.use(cookieParser());

  app.use(express.json({ limit: '10mb' })); // JSON 파싱 (용량 제한 등 커스텀)
  app.use(express.urlencoded({ extended: true })); // 폼 파싱

  app.use(
    session({
      name: 'connect.sid',
      secret: 'hello-world',
      resave: false,
      saveUninitialized: false,
      rolling: true,
      cookie: {
        maxAge: 86400000,
        sameSite: 'lax', // same-origin 요청에 쿠키 항상 포함
        secure: false, // 개발환경은 false, https 환경은 true
        path: '/', // 전체 경로에 대해 쿠키 적용
      },
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // 정적 애셋 설정 (캐시 헤더 포함)
  const cacheTime = {
    oneYear: 31536000, // 1년 (초)
    oneMonth: 2592000, // 30일 (초)
    oneWeek: 604800, // 1주일 (초)
  };

  app.useStaticAssets(join(process.cwd(), 'resources', 'public'), {
    prefix: '/public',
    maxAge: cacheTime.oneYear * 1000, // 밀리초로 변환
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
      // 파일 확장자별 캐시 정책
      if (path.endsWith('.woff2')) {
        // 폰트 파일: 1년
        res.setHeader('Cache-Control', `public, max-age=${cacheTime.oneYear}`);
      } else if (path.endsWith('.js') || path.endsWith('.css')) {
        // JS/CSS 파일: 1년
        // 빌드 시 개발 편의성을 위해 별도로 immutable 을 붙이진 않음.
        // immutable을 사용하려면 css, js 파일 이름에 난수를 붙여야하는데 설정이 좀 더 귀찮아짐
        res.setHeader('Cache-Control', `public, max-age=${cacheTime.oneYear}`);
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

  // /uploads 경로로 storage/uploads 폴더를 서비스
  app.useStaticAssets(join(process.cwd(), 'storage', 'uploads'), {
    prefix: '/uploads',
    maxAge: cacheTime.oneMonth * 1000, // 예: 30일 캐시
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
      // 필요시 파일 확장자별 캐시 정책 추가 가능
      res.setHeader('Cache-Control', `public, max-age=${cacheTime.oneMonth}`);
    },
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
