import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { NestMvcReq } from 'nestjs-mvc-tools';

@Controller({ path: 'sessions' })
export class SessionsController {
  constructor(private readonly configService: ConfigService) {}

  @Get('/login')
  async login(@Req() req: NestMvcReq, @Res() res: Response) {
    console.log('=== LOGIN GET 시작 ===');
    console.log('세션 상태:', req.session?.isLoggedIn);
    console.log('요청 경로:', req.path);
    console.log('요청 URL:', req.url);

    // 이미 로그인된 경우 admin으로 리다이렉트
    if (req.session?.isLoggedIn) {
      console.log('이미 로그인됨 - 리다이렉트');
      return res.redirect('/admin');
    }

    console.log('템플릿 렌더링 시작');

    try {
      const result = await req.view.render('pages/sessions/login');
      console.log('템플릿 렌더링 완료');
      return res.send(result);
    } catch (error) {
      console.error('템플릿 렌더링 오류:', error);
      throw error;
    }
  }

  @Post('/login')
  async doLogin(@Req() req: NestMvcReq, @Res() res: Response) {
    console.log(req.body);

    const { username, password } = req.body;

    const adminUsername = this.configService.get<string>('ADMIN_USERNAME');
    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD');

    // 인증 확인
    if (username !== adminUsername || password !== adminPassword) {
      throw new BadRequestException('아이디 또는 비밀번호가 잘못되었습니다.');
    }

    // 세션에 로그인 상태 저장
    req.session.isLoggedIn = true;
    req.session.username = username;

    req.flash.success('로그인 성공');
    return res.redirect('/admin');
  }

  @Post('/logout')
  async logout(@Req() req: NestMvcReq, @Res() res: Response) {
    // 세션 삭제
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destroy error:', err);
      }
    });

    req.flash.success('로그아웃 되었습니다.');
    return res.redirect('/sessions/login');
  }
}
