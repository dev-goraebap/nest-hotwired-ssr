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

import { SharedCategoriesService } from 'src/shared';

const themes = [
  { type: 'light', name: 'light' },
  { type: 'dark', name: 'dark' },
  { type: 'cupcake', name: 'cupcake' },
  { type: 'retro', name: 'retro' },
];

const languages = [
  { code: 'en', name: 'English' },
  { code: 'ko', name: '한국어' },
];

@Injectable()
export class GlobalPageStatesInterceptor implements NestInterceptor {
  private readonly logger = new Logger(GlobalPageStatesInterceptor.name);

  constructor(private readonly categoriesService: SharedCategoriesService) {}

  async intercept(context: ExecutionContext, next: CallHandler<any>) {
    // View 인스턴스 가져오기
    const req: Request = context.switchToHttp().getRequest();
    const view = req['view'] as NestMvcView;

    if (!view) {
      throw new Error('Edge View 인스턴스가 초기화되지않음');
    }

    // 현재 요청의 언어 가져오기 (I18n 컨텍스트 우선, 없으면 쿠키에서)
    const i18nContext = I18nContext.current();
    const lang = i18nContext?.lang;

    // 언어 코드를 전달하여 카테고리 가져오기
    const categories = await this.categoriesService.getSidebarCategories(lang);

    // 전역 테마설정
    const theme = this.initTheme(req);
    if (theme) {
      const themesWithActive = themes.map((t) => ({
        ...t,
        isActive: t.type === theme,
      }));
      view.share({ theme, themes: themesWithActive });
    }

    // 언어 설정과 함께 전역 상태 처리
    const languagesWithActive = languages.map((l) => ({
      ...l,
      isActive: l.code === lang,
    }));

    // 전역 상태로 lang, categories, themes, languages 처리
    view.share({
      lang,
      categories,
      languages: languagesWithActive,
      currentLanguage: lang,
    });

    return next.handle();
  }

  /**
   * 쿠키에서 테마 정보 가져오기
   * @description
   * - cookie-parser 설정이 되어있지 않으면 쿠키를 읽을 수 없습니다.
   * - 쿠키에서 theme 값을 가져올 수 없으면 retro가 기본값입니다.
   */
  initTheme(req: Request): string {
    const defaultTheme = 'retro';
    const cookies = req.cookies;
    if (!cookies) {
      this.logger.warn('쿠키가 활성화되지 않았습니다.');
      return defaultTheme;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const theme = cookies?.theme;
    if (!theme) {
      return defaultTheme;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return theme;
  }

  /**
   * 쿠키에서 언어 정보 가져오기
   * @description
   * - cookie-parser 설정이 되어있지 않으면 쿠키를 읽을 수 없습니다.
   * - 쿠키에서 language 값을 가져올 수 없으면 ko가 기본값입니다.
   */
  initLanguage(req: Request): string {
    const defaultLanguage = 'en';
    const cookies = req.cookies;

    if (!cookies) {
      this.logger.warn('쿠키가 활성화되지 않았습니다.');
      return defaultLanguage;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const language = cookies?.language;
    if (!language) {
      return defaultLanguage;
    }

    // 지원하는 언어인지 확인
    const supportedLanguages = languages.map((l) => l.code);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    if (!supportedLanguages.includes(language)) {
      this.logger.warn(`지원하지 않는 언어: ${language}`);
      return defaultLanguage;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return language;
  }
}
