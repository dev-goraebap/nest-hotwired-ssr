import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { MvcValidationException } from 'nestjs-mvc-tools';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    // 세션에서 로그인 상태 확인
    if (request.session?.isLoggedIn) {
      return true;
    }

    // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
    throw new MvcValidationException('로그인이 필요합니다.', {
      redirectUrl: '/sessions/login',
    });
  }
}
