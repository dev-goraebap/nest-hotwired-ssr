import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { I18nContext } from 'nestjs-i18n';
import { NestMvcView } from 'nestjs-mvc-tools';

import { CategoriesService } from '../services/categories.service';

const themes = [
  { type: 'light', name: 'light' },
  { type: 'dark', name: 'dark' },
  { type: 'cupcake', name: 'cupcake' },
  // { type: 'lemonade', name: '레몬에이드' },
  // { type: 'valentine', name: '발렌타인' },
  { type: 'retro', name: 'retro' },
  // { type: 'caramellatte', name: '카라멜 라떼' },
];

@Injectable()
export class GlobalPageStatesInterceptor implements NestInterceptor {
  private readonly logger = new Logger(GlobalPageStatesInterceptor.name);

  constructor(private readonly categoriesService: CategoriesService) {}

  async intercept(context: ExecutionContext, next: CallHandler<any>) {
    // View 인스턴스 가져오기
    const req: Request = context.switchToHttp().getRequest();
    const view = req['view'] as NestMvcView;

    if (!view) {
      throw new Error('Edge View 인스턴스가 초기화되지않음');
    }

    // 현재 요청의 언어 가져오기
    const i18nContext = I18nContext.current();
    const lang = i18nContext?.lang;

    // 언어 코드를 전달하여 카테고리 가져오기
    const categories = await this.categoriesService.getSidebarCategories(lang);
    console.log(categories);

    // 전역 테마설정
    const theme = this.initTheme(req);
    if (theme) {
      this.logger.debug('테마 요청됨');

      console.log(theme);

      const themesWithActive = themes.map((t) => ({
        ...t,
        isActive: t.type === theme,
      }));

      view.share({ theme, themes: themesWithActive });
    }

    // 전역 상태로 lang 처리
    view.share({ lang, categories, themes });

    return next.handle();
  }

  /**
   * 쿠키에서 테마 정보 가져오기
   * @description
   * - cookie-parser 설정이 되어있지 않으면 쿠키를 읽을 수 없습니다.
   * - 쿠키에서 theme 값을 가져올 수 없으면 lemonade가 기본값입니다.
   */
  initTheme(req: Request): string {
    const defaultTheme = 'retro';
    const cookies = req.cookies;
    if (!cookies) {
      this.logger.warn('쿠키가 활성화되지 않았습니다.');
      return defaultTheme;
    }

    const theme = cookies?.theme;
    if (!theme) {
      return defaultTheme;
    }
    return theme;
  }
}
