import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { NestMvcBaseExceptionHandler, NestMvcReq } from 'nestjs-mvc-tools';

@Catch(HttpException)
export class AppExceptionFilter
  extends NestMvcBaseExceptionHandler
  implements ExceptionFilter
{
  catch(exception: HttpException, host: ArgumentsHost) {
    const req: NestMvcReq = host.switchToHttp().getRequest();
    const res: Response = host.switchToHttp().getResponse();
    return this.handleMvcException(exception, req, res);
  }
}
