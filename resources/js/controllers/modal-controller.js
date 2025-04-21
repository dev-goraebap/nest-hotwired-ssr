import { Controller } from '/js/stimulus@3.2.2.min.js';

/**
 * 모달 창을 제어하는 Stimulus 컨트롤러
 * 모달 열기/닫기, 확인 및 취소 기능을 담당
 */
export default class ModalController extends Controller {
  static targets = ['container', 'background', 'content'];

  // ------------------------------------------------------------
  // 1. 라이프사이클 콜백 (Stimulus에 의해 자동 호출)
  // ------------------------------------------------------------

  /**
   * 컨트롤러가 DOM에 연결될 때 호출됨
   */
  connect() {
    console.log('Modal controller connected');
  }

  // ------------------------------------------------------------
  // 3. HTML에서 직접 호출하는 액션 메서드 (data-action 속성으로 연결)
  // ------------------------------------------------------------

  /**
   * 모달 창을 열기
   * HTML에서 data-action="modal#open"로 호출
   * @param {Event} event - 클릭 이벤트 객체
   */
  open(event) {
    event.preventDefault();

    // 삭제할 항목의 ID와 링크를 가져옴
    if (event.currentTarget.dataset.id && event.currentTarget.href) {
      this.deleteId = event.currentTarget.dataset.id;
      this.deleteUrl = event.currentTarget.href;
    }

    this.containerTarget.classList.remove('hidden');

    // 애니메이션 효과
    setTimeout(() => {
      this.backgroundTarget.classList.add('opacity-50');
      this.contentTarget.classList.add('opacity-100', 'translate-y-0');
    }, 10);

    // 본문 스크롤 방지
    document.body.style.overflow = 'hidden';
  }

  /**
   * 모달 창을 닫기
   * HTML에서 data-action="modal#close"로 호출
   */
  close() {
    // 애니메이션 효과
    this.backgroundTarget.classList.remove('opacity-50');
    this.contentTarget.classList.remove('opacity-100', 'translate-y-0');

    setTimeout(() => {
      this.containerTarget.classList.add('hidden');
      // 본문 스크롤 재개
      document.body.style.overflow = 'auto';
    }, 300);
  }

  /**
   * 모달의 확인 버튼 클릭 시 실행됨 (삭제 등 동작 수행)
   * HTML에서 data-action="modal#confirm"로 호출
   */
  confirm() {
    if (this.deleteUrl) {
      window.location.href = this.deleteUrl;
    }
  }

  /**
   * 배경 클릭 시 모달 닫기
   * HTML에서 data-action="modal#backgroundClick"로 호출
   * @param {Event} event - 클릭 이벤트 객체
   */
  backgroundClick(event) {
    if (event.target === this.backgroundTarget) {
      this.close();
    }
  }

  /**
   * ESC 키 누를 시 모달 닫기
   * HTML에서 data-action="modal#keydown"으로 호출, 주로 window나 document에 연결
   * @param {KeyboardEvent} event - 키보드 이벤트 객체
   */
  keydown(event) {
    if (event.key === 'Escape') {
      this.close();
    }
  }
}
