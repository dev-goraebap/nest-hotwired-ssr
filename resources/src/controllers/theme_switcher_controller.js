import { Controller } from '@hotwired/stimulus';

export class ThemeSwitcherController extends Controller {
  static targets = ['button'];

  onChangeTheme(e) {
    const target = e.currentTarget;
    const themeType = target.dataset.type;

    // 전체 html 테마 변경
    document.documentElement.setAttribute('data-theme', themeType);

    // 쿠키 설정
    this.setThemeCookie(themeType);

    Turbo.visit(window.location.href);
  }

  setThemeCookie(theme) {
    const oneMonthInSeconds = 30 * 24 * 60 * 60;

    document.cookie = [
      `theme=${encodeURIComponent(theme)}`,
      `path=/`,
      `max-age=${oneMonthInSeconds}`,
      `SameSite=Lax`, // CSRF 보호
      location.protocol === 'https:' ? 'Secure' : '', // HTTPS에서만 Secure
    ]
      .filter(Boolean)
      .join('; ');
  }

  getThemeFromCookie() {
    const match = document.cookie.match(/(?:^|;\s*)theme=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : null;
  }
}
