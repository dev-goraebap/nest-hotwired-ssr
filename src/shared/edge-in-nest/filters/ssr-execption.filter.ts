import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { EdgeView } from 'src/shared/edge-in-nest';

@Catch(HttpException)
export class SsrExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(SsrExceptionFilter.name);

  async catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const edgeView = req['view'] as EdgeView;

    this.logger.warn(exception);

    // 잘못된 요청 처리 (400)
    if (status === HttpStatus.BAD_REQUEST) {
      edgeView.setFlash('alert', exception.message, req.body);
      // referer가 있으면 referer로, 없으면 fallback 경로로 리다이렉트
      const redirectUrl = req.headers.referer || req.originalUrl || '/';
      return res.redirect(303, redirectUrl);
    }

    // 에러 응답 상태 코드 설정
    res.status(status);

    try {
      // 에러 유형에 따른 적절한 페이지 렌더링
      switch (status) {
        case HttpStatus.FORBIDDEN:
          return res.send(
            await edgeView.render('pages/errors/index', {
              error: exception.message || '접근 권한이 없습니다',
              status: status,
            }),
          );
        case HttpStatus.NOT_FOUND:
          return res.send(
            await edgeView.render('pages/errors/index', {
              error: exception.message || '페이지를 찾을 수 없습니다',
              status: status,
            }),
          );

        default:
          return res.send(
            await edgeView.render('pages/errors/index', {
              error: exception.message || '서버 오류가 발생했습니다',
              status: status,
            }),
          );
      }
    } catch (renderError) {
      // 에러 페이지 렌더링 실패 시 기본 텍스트 응답
      this.logger.error('Error page rendering failed', renderError);
      return res.send(`Error ${status}: ${exception.message}`);
    }
  }
}
