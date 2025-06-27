import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { EdgeJsView, View } from 'src/shared/edge-js';

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

  @Get()
  async index(@View() view: EdgeJsView, @Res() res: Response) {
    const currentTheme = view.getTheme();

    const themesWithActive = this.themes.map((theme) => ({
      ...theme,
      isActive: theme.type === currentTheme,
    }));

    const template = await view.render(
      'page::lab/theme-switcher-example/index',
      {
        themes: themesWithActive,
      },
    );
    return res.send(template);
  }
}
