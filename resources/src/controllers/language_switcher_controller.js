import { Controller } from '@hotwired/stimulus';

export class LanguageSwitcherController extends Controller {
  static targets = ['button'];

  onChangeLanguage(e) {
    const target = e.currentTarget;
    const lang = target.dataset.lang;

    // 언어 쿠키 설정
    this.setLanguageCookie(lang);

    Turbo.visit(window.location.href);
  }

  setLanguageCookie(lang) {
    const oneYearInSeconds = 365 * 24 * 60 * 60;

    document.cookie = [
      `language=${encodeURIComponent(lang)}`,
      `path=/`,
      `max-age=${oneYearInSeconds}`, // 1년간 유지
      `SameSite=Lax`,
      location.protocol === 'https:' ? 'Secure' : '',
    ]
      .filter(Boolean)
      .join('; ');
  }

  getLanguageFromCookie() {
    const match = document.cookie.match(/(?:^|;\s*)language=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : null;
  }
}
