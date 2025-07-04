import { Controller } from '@hotwired/stimulus';

export class FlashController extends Controller {
  static values = {
    time: Number,
  };

  connect() {
    // 시간값이 없으면 기본 3초로 설정
    if (!this.hasTimeValue) {
      this.timeValue = 3000;
    }

    setTimeout(() => {
      this.element.remove();
    }, this.timeValue);
  }

  onClose() {
    this.element.remove();
  }
}
