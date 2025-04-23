import * as winston from 'winston';
import { winstonConfig } from './winston.config';

export function createLogger(context: string): winston.Logger {
  const logger = winston.createLogger({
    ...winstonConfig,
    defaultMeta: { context },
  });
  
  // 기존 메서드를 래핑하여 텍스트 포맷으로 강제 변환
  const originalInfo = logger.info;
  logger.info = function(message: any, ...args: any[]) {
    if (typeof message === 'object') {
      message = JSON.stringify(message);
    }
    return originalInfo.call(this, message, ...args);
  };
  
  const originalError = logger.error;
  logger.error = function(message: any, ...args: any[]) {
    if (typeof message === 'object') {
      message = JSON.stringify(message);
    }
    return originalError.call(this, message, ...args);
  };
  
  // 나머지 로그 레벨도 필요하면 같은 방식으로 래핑
  
  return logger;
}