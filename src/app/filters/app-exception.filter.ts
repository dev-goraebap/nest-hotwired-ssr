import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { NestMvcBaseExceptionHandler, NestMvcReq } from 'nestjs-mvc-tools';

@Catch(HttpException)
export class AppExceptionFilter
  extends NestMvcBaseExceptionHandler
  implements ExceptionFilter
{
  private readonly logger = new Logger(AppExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const req: NestMvcReq = host.switchToHttp().getRequest();
    const res: Response = host.switchToHttp().getResponse();

    this.logger.warn(exception.getStatus());
    this.logger.warn(exception.message);

    // ---------------------------------------------------------
    // API 예외처리
    // ---------------------------------------------------------

    if (req.url.startsWith('/api')) {
      return res.json({
        status: exception.getStatus(),
        message: exception.message,
      });
    }

    // ---------------------------------------------------------
    // 페이지 예외처리
    // ---------------------------------------------------------

    return this.handleMvcException(exception, req, res);
  }
}
