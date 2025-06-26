import { Controller } from '@hotwired/stimulus';

export class ThemeSwitcherController extends Controller {
  static targets = ['button'];

  onChangeTheme(e) {
    const target = e.currentTarget;
    const theme = target.dataset.theme;

    // 전체 html 테마 변경
    document.documentElement.setAttribute('data-theme', theme);

    // 쿠키에 테마 저장 (1달 유효)
    const oneMonthInSeconds = 30 * 24 * 60 * 60; // 30일을 초로 환산
    document.cookie = `theme=${theme}; path=/; max-age=${oneMonthInSeconds}`;

    // 모든 버튼들 강조효과 제거
    this.buttonTargets.forEach((x) => {
      x.classList.remove('border-primary', 'border-2');
    });
    // 선택된 버튼에 강조효과 추가
    target.classList.add('border-primary', 'border-2');
  }
}
