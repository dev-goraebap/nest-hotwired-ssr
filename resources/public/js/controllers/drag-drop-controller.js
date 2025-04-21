import { Controller } from '/public/js/stimulus@3.2.2.min.js';

/**
 * 드래그 앤 드롭으로 항목 순서를 관리하는 Stimulus 컨트롤러
 */
export default class extends Controller {
  static targets = ['container', 'item', 'confirmationBar', 'progressBar'];
  static values = {
    url: String, // API 엔드포인트 URL (필수)
    confirmationDelay: { type: Number, default: 5000 }, // 지연 시간(ms), 기본값 5초
  };

  // ------------------------------------------------------------
  // 1. 라이프사이클 콜백 (Stimulus에 의해 자동 호출)
  // ------------------------------------------------------------

  /**
   * 컨트롤러가 DOM에 연결될 때 호출됨
   */
  connect() {
    console.log('Drag-drop controller connected');
    this.initializeDragDrop();
    this.pendingOrderUpdate = null;
    this.countdown = null;
    // 원래 순서 저장
    this.originalOrder = Array.from(this.itemTargets).map(
      (item) => item.dataset.id,
    );
  }

  // ------------------------------------------------------------
  // 2. 값 변경 콜백 (값이 변경될 때 Stimulus에 의해 자동 호출)
  // ------------------------------------------------------------

  /**
   * confirmationDelay 값이 변경될 때 호출됨
   */
  confirmationDelayValueChanged() {
    this.updateDelayText();
  }

  // ------------------------------------------------------------
  // 3. HTML에서 직접 호출하는 액션 메서드 (data-action 속성으로 연결)
  // ------------------------------------------------------------

  /**
   * 순서 업데이트를 취소하고 원래 순서로 돌아감
   * HTML에서 data-action="drag-drop#cancelUpdate"로 호출
   */
  cancelUpdate() {
    // 타이머 정리
    if (this.countdown) {
      clearTimeout(this.countdown);
      this.countdown = null;
    }

    // UI 숨기기
    this.hideConfirmationUI();

    // 원래 순서로 되돌리기 - 페이지를 새로고침하는 대신 DOM을 조작
    const container = this.containerTarget;
    const currentItems = {};

    // 현재 아이템들을 ID별로 맵에 저장
    this.itemTargets.forEach((item) => {
      currentItems[item.dataset.id] = item;
    });

    // 원래 순서대로 다시 정렬
    if (this.originalOrder && this.originalOrder.length > 0) {
      // 컨테이너를 비우고
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }

      // 원래 순서대로 아이템 추가
      this.originalOrder.forEach((id) => {
        if (currentItems[id]) {
          container.appendChild(currentItems[id]);
        }
      });
    } else {
      // 원래 순서가 없으면 페이지 새로고침
      window.location.reload();
    }
  }

  // ------------------------------------------------------------
  // 4. 내부 이벤트 핸들러 (각 아이템에 이벤트 리스너로 등록됨)
  // ------------------------------------------------------------

  /**
   * 드래그 시작 시 처리
   */
  handleDragStart(e) {
    // 이미 진행 중인 업데이트가 있다면 취소
    if (this.countdown) {
      clearTimeout(this.countdown);
      this.countdown = null;
    }

    this.pendingOrderUpdate = null;

    if (this.hasProgressBarTarget) {
      this.progressBarTarget.style.width = '0%';
      this.progressBarTarget.style.transition = 'none';
    }

    if (this.hasConfirmationBarTarget) {
      this.confirmationBarTarget.classList.add('hidden');
    }

    e.target.classList.add('dragging');
    e.dataTransfer.setData('text/plain', e.target.dataset.id);
    e.dataTransfer.effectAllowed = 'move';
  }

  /**
   * 드래그 오버 시 기본 동작 방지
   */
  handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    return false;
  }

  /**
   * 드래그 요소가 들어왔을 때
   */
  handleDragEnter(e) {
    e.currentTarget.classList.add('drag-over');
  }

  /**
   * 드래그 요소가 나갔을 때
   */
  handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
  }

  /**
   * 드롭 시 처리
   */
  handleDrop(e) {
    e.stopPropagation();
    e.preventDefault();

    const draggedItemId = e.dataTransfer.getData('text/plain');
    if (!draggedItemId) {
      console.warn('드래그된 아이템의 ID를 가져올 수 없습니다.');
      return false;
    }

    const draggedItem = this.itemTargets.find(
      (item) => item.dataset.id === draggedItemId,
    );
    if (!draggedItem) {
      console.warn('드래그된 아이템을 찾을 수 없습니다:', draggedItemId);
      return false;
    }

    const dropTarget = e.currentTarget;
    if (!dropTarget) {
      console.warn('드롭 대상을 찾을 수 없습니다.');
      return false;
    }

    if (draggedItem !== dropTarget) {
      const container = this.containerTarget;
      const allItems = Array.from(this.itemTargets);
      const draggedIndex = allItems.indexOf(draggedItem);
      const dropIndex = allItems.indexOf(dropTarget);

      // 드래그한 아이템을 드롭 위치로 재배치
      try {
        if (draggedIndex < dropIndex) {
          if (dropTarget.nextSibling) {
            container.insertBefore(draggedItem, dropTarget.nextSibling);
          } else {
            container.appendChild(draggedItem);
          }
        } else {
          container.insertBefore(draggedItem, dropTarget);
        }

        // 순서 업데이트를 바로 실행하지 않고, 확인 UI 표시
        this.showConfirmationUI();
      } catch (error) {
        console.error('드래그 앤 드롭 처리 중 오류 발생:', error);
      }
    }

    return false;
  }

  /**
   * 드래그 종료 시 처리
   */
  handleDragEnd(e) {
    this.itemTargets.forEach((item) => {
      item.classList.remove('dragging');
      item.classList.remove('drag-over');
    });
  }

  // ------------------------------------------------------------
  // 5. 내부 유틸리티 메서드 (컨트롤러 내에서만 사용)
  // ------------------------------------------------------------

  /**
   * 드래그 앤 드롭 기능 초기화
   * @private
   */
  initializeDragDrop() {
    // 각 아이템에 드래그 이벤트 설정
    this.itemTargets.forEach((item) => {
      item.setAttribute('draggable', 'true');
      item.addEventListener('dragstart', this.handleDragStart.bind(this));
      item.addEventListener('dragover', this.handleDragOver.bind(this));
      item.addEventListener('dragenter', this.handleDragEnter.bind(this));
      item.addEventListener('dragleave', this.handleDragLeave.bind(this));
      item.addEventListener('drop', this.handleDrop.bind(this));
      item.addEventListener('dragend', this.handleDragEnd.bind(this));
    });

    // 초기 지연 시간 텍스트 설정
    this.updateDelayText();
  }

  /**
   * 지연 시간 텍스트 업데이트
   * @private
   */
  updateDelayText() {
    // 밀리초를 초로 변환
    const delaySeconds = this.confirmationDelayValue / 1000;

    // 확인 UI 내의 delay-text 클래스를 가진 요소 찾기
    const delayText = this.element.querySelector('.delay-text');
    if (delayText) {
      delayText.textContent = `${delaySeconds}초 후 자동으로 적용됩니다. 취소하려면 '취소' 버튼을 클릭하세요.`;
    }
  }

  /**
   * 확인 UI 표시
   * @private
   */
  showConfirmationUI() {
    // 이미 진행 중인 업데이트가 있다면 취소
    if (this.countdown) {
      clearTimeout(this.countdown);
    }

    // 확인 바 표시
    if (this.hasConfirmationBarTarget) {
      // 지연 시간 텍스트 업데이트 (필요시)
      this.updateDelayText();

      // UI 표시
      this.confirmationBarTarget.classList.remove('hidden');

      // 현재 아이템 순서 저장
      this.pendingOrderUpdate = this.collectCurrentOrder();

      // 프로그레스 바 초기화 및 애니메이션 시작
      if (this.hasProgressBarTarget) {
        const progressBar = this.progressBarTarget;
        progressBar.style.width = '0%';

        // 지연 시간을 HTML에서 설정한 값으로 사용
        const delaySeconds = this.confirmationDelayValue / 1000;
        progressBar.style.transition = `width ${delaySeconds}s linear`;

        // 잠시 대기 후 프로그레스 바 애니메이션 시작
        setTimeout(() => {
          progressBar.style.width = '100%';
        }, 50);
      }

      // 카운트다운 시작 - HTML에서 설정한 지연 시간 사용
      this.countdown = setTimeout(() => {
        this.applyOrderUpdate();
      }, this.confirmationDelayValue);
    } else {
      // 확인 UI가 없는 경우 바로 적용
      this.applyOrderUpdate();
    }
  }

  /**
   * 확인 UI 숨기기
   * @private
   */
  hideConfirmationUI() {
    if (this.hasConfirmationBarTarget) {
      this.confirmationBarTarget.classList.add('hidden');
    }

    if (this.hasProgressBarTarget) {
      this.progressBarTarget.style.width = '0%';
      this.progressBarTarget.style.transition = 'none';
    }
  }

  /**
   * 현재 순서 정보 수집
   * @private
   * @returns {Array<{id: number, order: number}>} 순서 정보 배열
   */
  collectCurrentOrder() {
    const items = Array.from(this.itemTargets);
    const orders = [];

    items.forEach((item, index) => {
      if (item.dataset.id) {
        const id = parseInt(item.dataset.id);
        orders.push({
          id: id,
          order: index + 1,
        });
      }
    });

    return orders;
  }

  /**
   * 순서 업데이트 적용
   * @private
   */
  applyOrderUpdate() {
    if (!this.pendingOrderUpdate || this.pendingOrderUpdate.length === 0) {
      console.warn('순서를 업데이트할 아이템이 없습니다.');
      this.hideConfirmationUI();
      return;
    }

    // URL 값은 반드시 외부에서 제공되어야 함
    if (!this.hasUrlValue) {
      console.error(
        'API URL이 지정되지 않았습니다. data-drag-drop-url-value 속성을 설정해주세요.',
      );
      this.hideConfirmationUI();
      return;
    }

    // 서버에 순서 업데이트 요청
    fetch(this.urlValue, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ orders: this.pendingOrderUpdate }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // 성공 메시지 표시
          this.showMessage(
            data.message || '순서가 업데이트되었습니다.',
            'success',
          );

          // 화면에 표시된 순서 번호 업데이트
          const items = Array.from(this.itemTargets);
          items.forEach((item, index) => {
            // 모든 .order-badge 요소를 찾아서 업데이트
            const orderBadges = item.querySelectorAll('.order-badge');
            orderBadges.forEach((badge) => {
              badge.textContent = index + 1;
            });
          });

          // 업데이트 완료 후 원래 순서를 새 순서로 업데이트
          this.originalOrder = items.map((item) => item.dataset.id);

          // 업데이트 완료 후 확인 UI 숨기기
          this.hideConfirmationUI();
        } else {
          // 에러 메시지 표시
          this.showMessage(
            data.message || '순서 업데이트에 실패했습니다.',
            'error',
          );
          this.hideConfirmationUI();
        }
      })
      .catch((error) => {
        console.error('순서 업데이트 요청 실패:', error);
        this.showMessage('네트워크 오류가 발생했습니다.', 'error');
        this.hideConfirmationUI();
      })
      .finally(() => {
        this.pendingOrderUpdate = null;
      });
  }

  /**
   * 메시지 표시
   * @private
   * @param {string} message - 표시할 메시지
   * @param {string} type - 메시지 타입 ('info', 'success', 'error')
   */
  showMessage(message, type = 'info') {
    // 이벤트 발생을 통한 메시지 표시
    const event = new CustomEvent('drag-drop:message', {
      detail: { message, type },
      bubbles: true,
    });
    this.element.dispatchEvent(event);

    // 콘솔에도 로그
    if (type === 'error') {
      console.error(message);
    } else {
      console.log(message);
    }
  }
}
