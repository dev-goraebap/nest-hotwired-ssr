import { CookieResolver, I18nOptions } from 'nestjs-i18n';
import { join } from 'path';

export const i18nOptions: I18nOptions = {
  fallbackLanguage: 'en', // 기본 언어
  loaderOptions: {
    path:
      process.env.NODE_ENV === 'development'
        ? join(process.cwd(), 'src', 'i18n')
        : join(process.cwd(), 'dist', 'i18n'),
    watch: process.env.NODE_ENV === 'development' || true,
  },
  resolvers: [{ use: CookieResolver, options: ['language'] }],
};
