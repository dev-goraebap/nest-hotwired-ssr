import { Controller } from '/public/js/stimulus@3.2.2.min.js';

/**
 * 확인 모달을 제어하는 Stimulus 컨트롤러
 * 확인/취소 액션이 필요한 다양한 작업에 재사용 가능
 */
export default class ConfirmController extends Controller {
  static targets = [
    'container',
    'background',
    'content',
    'title',
    'message',
    'confirmButton',
  ];

  // ------------------------------------------------------------
  // 1. 라이프사이클 콜백 (Stimulus에 의해 자동 호출)
  // ------------------------------------------------------------

  /**
   * 컨트롤러가 DOM에 연결될 때 호출됨
   */
  connect() {
    console.log('Confirm controller connected');
  }

  // ------------------------------------------------------------
  // 3. HTML에서 직접 호출하는 액션 메서드 (data-action 속성으로 연결)
  // ------------------------------------------------------------

  /**
   * 체크박스 클릭 시 모달을 표시하고 체크박스 상태를 원래대로 복원
   * HTML에서 data-action="confirm#toggleCheckAndConfirm"로 호출
   * @param {Event} event - 클릭 이벤트 객체
   */
  toggleCheckAndConfirm(event) {
    event.preventDefault();

    // 현재 체크박스의 상태를 원래대로 복원 (토글 방지)
    const checkbox = event.currentTarget;
    const isCurrentlyChecked = checkbox.checked;
    checkbox.checked = !isCurrentlyChecked;

    // 부모 폼 찾기
    let form;
    if (checkbox.dataset.formSelector) {
      form = checkbox.closest(checkbox.dataset.formSelector);
    }

    if (form) {
      // 폼의 데이터 속성에서 확인 메시지 가져오기
      this.confirmForm = form;

      // UI 설정
      if (form.dataset.confirmTitle) {
        this.titleTarget.textContent = form.dataset.confirmTitle;
      } else {
        this.titleTarget.textContent = '확인';
      }

      if (form.dataset.confirmMessage) {
        this.messageTarget.textContent = form.dataset.confirmMessage;
      } else {
        this.messageTarget.textContent = '이 작업을 진행하시겠습니까?';
      }

      // 모달 표시
      this.showConfirmModal();
    }

    console.log(form);
  }

  /**
   * Form 제출 시 확인 모달 표시
   * HTML에서 data-action="confirm#openFormConfirm"로 호출
   * @param {Event} event - 폼 제출 이벤트 객체
   */
  openFormConfirm(event) {
    event.preventDefault();
    this.confirmForm = event.currentTarget;

    // UI 설정
    if (this.confirmForm.dataset.confirmTitle) {
      this.titleTarget.textContent = this.confirmForm.dataset.confirmTitle;
    } else {
      this.titleTarget.textContent = '확인';
    }

    if (this.confirmForm.dataset.confirmMessage) {
      this.messageTarget.textContent = this.confirmForm.dataset.confirmMessage;
    } else {
      this.messageTarget.textContent = '이 작업을 진행하시겠습니까?';
    }

    this.showConfirmModal();
  }

  /**
   * 모달 창을 열기
   * HTML에서 data-action="confirm#open"로 호출
   * @param {Event} event - 클릭 이벤트 객체
   */
  open(event) {
    event.preventDefault();

    // 데이터셋에서 필요한 정보 추출
    const dataset = event.currentTarget.dataset;

    // 동작 타입과 ID, URL 등 정보 저장
    this.actionType = dataset.actionType || 'default';
    this.actionUrl = dataset.actionUrl || event.currentTarget.href || null;
    this.actionMethod = dataset.actionMethod || 'GET';

    // UI 설정
    if (dataset.title) {
      this.titleTarget.textContent = dataset.title;
    } else {
      this.titleTarget.textContent = '확인';
    }

    if (dataset.message) {
      this.messageTarget.textContent = dataset.message;
    } else {
      this.messageTarget.textContent = '이 작업을 진행하시겠습니까?';
    }

    if (dataset.confirmText) {
      this.confirmButtonTarget.textContent = dataset.confirmText;
    } else {
      this.confirmButtonTarget.textContent = '확인';
    }

    if (dataset.confirmClass) {
      this.confirmButtonTarget.className = dataset.confirmClass;
    } else {
      this.confirmButtonTarget.className =
        'inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none';
    }

    // 삭제 액션일 경우 빨간색 버튼으로 변경
    if (this.actionType === 'delete') {
      this.confirmButtonTarget.classList.remove(
        'bg-blue-600',
        'hover:bg-blue-700',
      );
      this.confirmButtonTarget.classList.add('bg-red-600', 'hover:bg-red-700');
    }

    this.showConfirmModal();
  }

  /**
   * 모달 창을 닫기
   * HTML에서 data-action="confirm#close"로 호출
   */
  close() {
    // 애니메이션 효과
    this.backgroundTarget.classList.remove('opacity-50');
    this.contentTarget.classList.remove('opacity-100', 'translate-y-0');

    setTimeout(() => {
      this.containerTarget.classList.add('hidden');
      // 본문 스크롤 재개
      document.body.style.overflow = 'auto';

      // 상태 초기화
      this.actionType = null;
      this.actionUrl = null;
      this.actionMethod = null;
      this.confirmForm = null;
    }, 300);
  }

  /**
   * 확인 버튼 클릭 시 실행됨 (삭제, 상태 변경 등 동작 수행)
   * HTML에서 data-action="confirm#confirm"로 호출
   */
  confirm() {
    // 폼이 있으면 폼 제출
    if (this.confirmForm) {
      this.confirmForm.submit();
    }
    // URL이 있으면 페이지 이동
    else if (this.actionUrl) {
      window.location.href = this.actionUrl;
    }

    // 모달 닫기
    this.close();
  }

  /**
   * 배경 클릭 시 모달 닫기
   * HTML에서 data-action="confirm#backgroundClick"로 호출
   * @param {Event} event - 클릭 이벤트 객체
   */
  backgroundClick(event) {
    if (event.target === this.backgroundTarget) {
      this.close();
    }
  }

  /**
   * ESC 키 누를 시 모달 닫기
   * HTML에서 data-action="confirm#keydown"으로 호출
   * @param {KeyboardEvent} event - 키보드 이벤트 객체
   */
  keydown(event) {
    if (event.key === 'Escape') {
      this.close();
    }
  }

  // ------------------------------------------------------------
  // 5. 내부 유틸리티 메서드 (컨트롤러 내에서만 사용)
  // ------------------------------------------------------------

  /**
   * 확인 모달 표시
   * @private
   */
  showConfirmModal() {
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
   * 메시지 표시
   * @private
   * @param {string} message - 표시할 메시지
   * @param {string} type - 메시지 타입 ('info', 'success', 'error')
   */
  showMessage(message, type = 'info') {
    // flash 메시지 컨트롤러가 있다면 이벤트 발생
    const event = new CustomEvent('confirm:message', {
      detail: { message, type },
      bubbles: true,
    });
    this.element.dispatchEvent(event);

    console.log(`[${type}] ${message}`);
  }
}
