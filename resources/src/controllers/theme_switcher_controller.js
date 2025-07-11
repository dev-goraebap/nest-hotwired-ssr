import { Controller } from '@hotwired/stimulus';

export class ThemeSwitcherController extends Controller {
  static targets = ['button'];

  onChangeTheme(e) {
    const target = e.currentTarget;
    const theme = target.dataset.theme;

    // 전체 html 테마 변경
    document.documentElement.setAttribute('data-theme', theme);

    // 쿠키 설정
    this.setThemeCookie(theme);

    // 모든 버튼들 강조효과 제거
    this.highlightActiveButton(theme);
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

  highlightActiveButton(theme) {
    this.buttonTargets.forEach((button) => {
      if (button.dataset.theme === theme) {
        button.classList.add('border-primary', 'border-2');
      } else {
        button.classList.remove('border-primary', 'border-2');
      }
    });
  }
}
