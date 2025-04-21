import { Controller } from '/public/js/stimulus@3.2.2.min.js';

/**
 * 플래시 메시지를 제어하는 Stimulus 컨트롤러
 * 메시지 표시 및 닫기 기능을 담당
 */
export default class FlashMessageController extends Controller {
  // ------------------------------------------------------------
  // 3. HTML에서 직접 호출하는 액션 메서드 (data-action 속성으로 연결)
  // ------------------------------------------------------------

  /**
   * 플래시 메시지를 닫는 메서드
   * HTML에서 data-action="flash-message#close"로 호출
   */
  close() {
    // 닫기 버튼 클릭 시 요소에 투명도 0 적용 (페이드 아웃 효과)
    this.element.classList.add('opacity-0');

    // 애니메이션 효과를 위해 약간의 딜레이 후 요소 제거
    setTimeout(() => {
      this.element.remove();
    }, 300); // 300ms 후 DOM에서 완전히 제거
  }
}
