import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res
} from '@nestjs/common';
import { Request, Response } from 'express';
import { DocumentsService } from 'src/app/services/documents.service';
import { EdgeView, View } from 'src/shared/edge-in-nest';

@Controller({ path: 'lab/theme-switcher-example' })
export class ThemeSwitcherExampleController {
  private readonly themes = [
    { type: 'light', name: '라이트' },
    { type: 'dark', name: '다크' },
    { type: 'cupcake', name: '컵케익' },
    { type: 'lemonade', name: '레몬에이드' },
    { type: 'valentine', name: '발렌타인' },
    { type: 'retro', name: '레트로' },
    { type: 'caramellatte', name: '카라멜 라떼' },
  ];

  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  async index(@View() view: EdgeView, @Req() req: Request) {
    const currentTheme = req.cookies.theme || 'lemonade'; // 쿠키에서 테마 읽기

    const themesWithActive = this.themes.map((theme) => ({
      ...theme,
      isActive: theme.type === currentTheme,
    }));

    const document = await this.documentsService.getBySlug(
      '/lab/theme-switcher-example',
    );
    return await view.render('pages/lab/theme-switcher-example/index', {
      themes: themesWithActive,
      document,
    });
  }

  @Post()
  updateTheme(
    @Body('theme') theme: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    // 쿠키에 테마 저장 (1달 유효)
    const oneMonthInSeconds = 30 * 24 * 60 * 60; // 30일을 초로 환산
    res.cookie('theme', theme, {
      maxAge: oneMonthInSeconds * 1000, // 밀리초
      path: '/',
      httpOnly: true, // JavaScript에서 접근 불가
      secure: process.env.NODE_ENV === 'production', // HTTPS에서만 전송
      sameSite: 'lax',
    });

    res.redirect('/lab/theme-switcher-example');
  }
}
