import { Controller } from '/public/js/stimulus@3.2.2.min.js';

/**
 * 드래그 앤 드롭으로 항목 순서를 관리하는 Stimulus 컨트롤러
 */
export default class extends Controller {
  static targets = ['container', 'item'];
  static values = {
    url: String, // API 엔드포인트 URL (필수)
    orderBadgeSelector: { type: String, default: '.order-badge' } // 순서를 표시하는 요소의 선택자
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
    // 원래 순서 저장
    this.originalOrder = Array.from(this.itemTargets).map(
      (item) => item.dataset.id,
    );
  }

  // ------------------------------------------------------------
  // 4. 내부 이벤트 핸들러 (각 아이템에 이벤트 리스너로 등록됨)
  // ------------------------------------------------------------

  /**
   * 드래그 시작 시 처리
   */
  handleDragStart(e) {
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

        // 사용자에게 확인 후 저장
        const confirmSave = window.confirm('배너 순서를 변경하시겠습니까?');
        if (confirmSave) {
          // 사용자가 확인을 눌렀을 때만 변경사항 저장
          this.saveOrderChanges();
        } else {
          // 취소한 경우 원래 순서로 되돌리기
          this.revertToOriginalOrder();
        }
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
  }

  /**
   * 순서 변경 내용을 서버에 저장
   * @private
   */
  saveOrderChanges() {
    const orders = this.collectCurrentOrder();
    
    if (!orders || orders.length === 0) {
      console.warn('순서를 업데이트할 아이템이 없습니다.');
      return;
    }

    // URL 값은 반드시 외부에서 제공되어야 함
    if (!this.hasUrlValue) {
      console.error(
        'API URL이 지정되지 않았습니다. data-drag-drop-url-value 속성을 설정해주세요.',
      );
      return;
    }

    // 서버에 순서 업데이트 요청
    fetch(this.urlValue, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ orders }),
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
            // 모든 순서 배지 요소를 찾아서 업데이트
            if(this.hasOrderBadgeSelectorValue) {
              const orderBadges = item.querySelectorAll(this.orderBadgeSelectorValue);
              orderBadges.forEach((badge) => {
                badge.textContent = index + 1;
              });
            }
          });

          // 업데이트 완료 후 원래 순서를 새 순서로 업데이트
          this.originalOrder = items.map((item) => item.dataset.id);
        } else {
          // 에러 메시지 표시
          this.showMessage(
            data.message || '순서 업데이트에 실패했습니다.',
            'error',
          );
          // 실패 시 원래 순서로 되돌리기
          this.revertToOriginalOrder();
        }
      })
      .catch((error) => {
        console.error('순서 업데이트 요청 실패:', error);
        this.showMessage('네트워크 오류가 발생했습니다.', 'error');
        // 오류 시 원래 순서로 되돌리기
        this.revertToOriginalOrder();
      });
  }

  /**
   * 원래 순서로 되돌리기
   * @private
   */
  revertToOriginalOrder() {
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
   * 메시지 표시
   * @private
   * @param {string} message - 표시할 메시지
   * @param {string} type - 메시지 타입 ('info', 'success', 'error')
   */
  showMessage(message, type = 'info') {
    // 간단하게 alert로 성공 메시지만 표시
    if (type === 'success') {
      alert(message);
    }
    
    // 콘솔에도 로그
    if (type === 'error') {
      console.error(message);
    } else {
      console.log(message);
    }
  }
}