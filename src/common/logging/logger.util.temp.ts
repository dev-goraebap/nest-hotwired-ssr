import * as winston from 'winston';
import { winstonConfig } from './winston.config.temp';

export function createLogger(context: string): winston.Logger {
  return winston.createLogger({
    ...winstonConfig,
    defaultMeta: { context },
  });
}
