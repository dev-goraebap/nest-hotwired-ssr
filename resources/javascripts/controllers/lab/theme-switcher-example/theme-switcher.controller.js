import { Controller } from '@hotwired/stimulus';

export class ThemeSwitcherController extends Controller {
  beforeSubmit(event) {
    console.log(
      'Form is about to be submitted for theme:',
      event.target.querySelector('input[name="theme"]').value,
    );

    // 전체 html 테마 변경
    const theme = event.target.querySelector('input[name="theme"]').value;
    document.documentElement.setAttribute('data-theme', theme);
  }
}
