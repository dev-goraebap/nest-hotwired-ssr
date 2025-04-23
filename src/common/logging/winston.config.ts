import {
  utilities as nestWinstonModuleUtilities,
  WinstonModuleOptions,
} from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { join } from 'path';

// 로그 저장 경로 설정
const logDir = join(process.cwd(), 'logs');

// 텍스트 기반 로그 포맷 정의
const textFormat = winston.format.printf(
  ({ level, message, timestamp, context, ...rest }) => {
    let log = `${timestamp} [${level.toUpperCase()}]`;

    if (context) {
      log += ` [${context}]`;
    }

    log += `: ${message}`;

    // 추가 정보가 있다면 텍스트로 변환하여 포함
    if (Object.keys(rest).length > 0) {
      const additionalInfo = Object.entries(rest)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
      log += ` - ${additionalInfo}`;
    }

    return log;
  },
);

export const winstonConfig: WinstonModuleOptions = {
  transports: [
    // 콘솔 로그 설정 (가독성을 위해 nestLike 포맷 유지)
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

    // 일반 로그 파일 설정 (텍스트 형식)
    new winston.transports.DailyRotateFile({
      level: 'info',
      dirname: join(logDir, 'application'),
      filename: 'application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        textFormat,
      ),
    }),

    // 에러 로그 파일 설정 (텍스트 형식)
    new winston.transports.DailyRotateFile({
      level: 'error',
      dirname: join(logDir, 'error'),
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        textFormat,
      ),
    }),
  ],

  // 예외/거부 처리 (텍스트 형식)
  exceptionHandlers: [
    new winston.transports.DailyRotateFile({
      dirname: join(logDir, 'exceptions'),
      filename: 'exceptions-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        textFormat,
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
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        textFormat,
      ),
    }),
  ],
};
