import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as session from 'express-session';
import { join } from 'path';

import { MainModule } from './main.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(MainModule);

  const configService = app.get(ConfigService);

  app.use(cookieParser());

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  app.use(
    session({
      name: 'connect.sid',
      secret: configService.get('SESSION_SECRET')!,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24시간 (밀리초)
        httpOnly: true, // XSS 보안
        secure: 'auto',
        sameSite: 'lax', // CSRF 보호
      },
    }),
  );

  app.useStaticAssets(join(process.cwd(), 'resources', 'public'), {
    prefix: '/public',
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
