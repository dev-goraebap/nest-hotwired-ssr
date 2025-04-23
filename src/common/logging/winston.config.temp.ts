import {
  utilities as nestWinstonModuleUtilities,
  WinstonModuleOptions,
} from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { join } from 'path';

// 로그 저장 경로 설정
const logDir = join(process.cwd(), 'logs');

export const winstonConfig: WinstonModuleOptions = {
  transports: [
    // 콘솔 로그 설정
    new winston.transports.Console({
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      format: winston.format.combine(
        winston.format.timestamp(),
        nestWinstonModuleUtilities.format.nestLike('NestHotwiredApp', {
          colors: true,
          prettyPrint: true,
        }),
      ),
    }),

    // 일반 로그 파일 설정 (daily rotate)
    new winston.transports.DailyRotateFile({
      level: 'info',
      dirname: join(logDir, 'application'),
      filename: 'application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),

    // 에러 로그 파일 설정 (daily rotate)
    new winston.transports.DailyRotateFile({
      level: 'error',
      dirname: join(logDir, 'error'),
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
  ],

  // 예외/거부 처리
  exceptionHandlers: [
    new winston.transports.DailyRotateFile({
      dirname: join(logDir, 'exceptions'),
      filename: 'exceptions-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
  ],
  rejectionHandlers: [
    new winston.transports.DailyRotateFile({
      dirname: join(logDir, 'rejections'),
      filename: 'rejections-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
  ],
};
