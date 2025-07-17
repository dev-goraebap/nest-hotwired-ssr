import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Response } from 'express';
import { NestMvcReq } from 'nestjs-mvc-tools';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const req: NestMvcReq = context.switchToHttp().getRequest();
    const res: Response= context.switchToHttp().getResponse();

    // 세션에서 로그인 상태 확인
    if (req.session?.isLoggedIn) {
      return true;
    }

    req.flash.error('로그인이 필요합니다.');
    res.redirect('/session/login');
    return false;
  }
}
