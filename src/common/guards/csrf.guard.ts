import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class CsrfGuard implements CanActivate {
  private readonly logger = new Logger(CsrfGuard.name);

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req: Request = context.switchToHttp().getRequest<Request>();

    // API 경로는 CSRF 검증 제외
    if (req.path.startsWith('/api/')) {
      return true;
    }

    // GET, HEAD, OPTIONS 등 안전한 요청은 CSRF 검증 제외
    if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
      return true;
    }

    // CSRF 토큰 검증 (헤더, 바디, 쿼리에서)
    const tokenFromHeader = req.headers['x-csrf-token'] as string;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const tokenFromBody = req.body?._csrft;
    // 쿼리에서 토큰 확인 (일반적으로 권장되지 않음)
    // 하지만 multipart/form-data + Multer 사용 시 Guard가 Interceptor보다 먼저 실행되어
    // body 파싱 전에 CSRF 검증이 필요한 경우 임시 해결책으로 사용

    const tokenFromQuery = req.query._csrft;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const token = tokenFromHeader || tokenFromBody || tokenFromQuery;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const sessionToken = req.session['csrfToken'];

    this.logger.debug(`CSRF Token from header: ${tokenFromHeader}`);
    this.logger.debug(`CSRF Token from body: ${tokenFromBody}`);
    // eslint-disable-next-line @typescript-eslint/no-base-to-string, @typescript-eslint/restrict-template-expressions
    this.logger.debug(`CSRF Token from query: ${tokenFromQuery}`);
    this.logger.debug(`CSRF Token from session: ${sessionToken}`);

    if (!token || token! == sessionToken) {
      this.logger.debug('Invalid CSRF token');
      throw new BadRequestException(
        '보안 토큰이 만료되었습니다. 페이지를 새로고침 후 다시 시도해주세요.',
      );
    }

    return true;
  }
}
