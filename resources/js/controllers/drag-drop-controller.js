import { Controller } from '/js/stimulus@3.2.2.min.js';

export default class extends Controller {
  static targets = ['container', 'item'];
  static values = {
    url: String, // API 엔드포인트 URL
    orderBadgeSelector: { type: String, default: '.order-badge' },
  };

  connect() {
    console.log('Drag-drop controller connected');
    this.initializeDragDrop();
  }

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

  // 드래그 시작 시 처리
  handleDragStart(e) {
    e.target.classList.add('dragging');
    e.dataTransfer.setData('text/plain', e.target.dataset.id);
    e.dataTransfer.effectAllowed = 'move';
  }

  // 드래그 오버 시 기본 동작 방지
  handleDragOver(e) {
    if (e.preventDefault) {
      e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
  }

  // 드래그 요소가 들어왔을 때
  handleDragEnter(e) {
    e.currentTarget.classList.add('drag-over');
  }

  // 드래그 요소가 나갔을 때
  handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
  }

  // 드롭 시 처리
  handleDrop(e) {
    e.stopPropagation();
    e.preventDefault();

    const draggedItemId = e.dataTransfer.getData('text/plain');
    const draggedItem = this.itemTargets.find(
      (item) => item.dataset.id === draggedItemId,
    );
    const dropTarget = e.currentTarget;

    if (draggedItem !== dropTarget) {
      const container = this.containerTarget;
      const allItems = Array.from(this.itemTargets);
      const draggedIndex = allItems.indexOf(draggedItem);
      const dropIndex = allItems.indexOf(dropTarget);

      // 드래그한 아이템을 드롭 위치로 재배치
      if (draggedIndex < dropIndex) {
        container.insertBefore(draggedItem, dropTarget.nextSibling);
      } else {
        container.insertBefore(draggedItem, dropTarget);
      }

      // 순서 업데이트
      this.updateOrder();
    }

    return false;
  }

  // 드래그 종료 시 처리
  handleDragEnd(e) {
    this.itemTargets.forEach((item) => {
      item.classList.remove('dragging');
      item.classList.remove('drag-over');
    });
  }

  // 순서 업데이트
  updateOrder() {
    // 현재 순서대로 아이템 정렬
    const items = Array.from(this.itemTargets);
    const orders = [];

    // 각 아이템의 새 순서 수집
    items.forEach((item, index) => {
      if (item.dataset.id) {
        const id = parseInt(item.dataset.id);
        orders.push({
          id: id,
          order: index + 1,
        });
      }
    });

    // 순서가 없으면 종료
    if (orders.length === 0) {
      console.warn('순서를 업데이트할 아이템이 없습니다.');
      return;
    }

    const url = this.urlValue;
    const badgeSelector = this.hasOrderBadgeSelectorValue
      ? this.orderBadgeSelectorValue
      : '.order-badge';

    // 서버에 순서 업데이트 요청
    fetch(url, {
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
          // 성공 메시지 표시 (옵션)
          this.showMessage(
            data.message || '순서가 업데이트되었습니다.',
            'success',
          );

          // 화면에 표시된 순서 번호 업데이트
          items.forEach((item, index) => {
            const orderBadge = item.querySelector(badgeSelector);
            if (orderBadge) {
              orderBadge.textContent = index + 1;
            }
          });
        } else {
          // 에러 메시지 표시
          this.showMessage(
            data.message || '순서 업데이트에 실패했습니다.',
            'error',
          );
        }
      })
      .catch((error) => {
        console.error('순서 업데이트 요청 실패:', error);
        this.showMessage('네트워크 오류가 발생했습니다.', 'error');
      });
  }

  // 메시지 표시 (옵션)
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
