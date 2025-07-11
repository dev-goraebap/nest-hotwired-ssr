import { Controller } from '@hotwired/stimulus';
import Sortable from 'sortablejs';

export class SortableController extends Controller {
  static targets = ['container'];

  static values = {
    orderApi: String,
  };

  connect() {
    this.sortable = Sortable.create(this.containerTarget, {
      handle: '[data-sortable-target="handle"]', // 드래그 핸들 지정
      animation: 150, // 애니메이션 속도
      ghostClass: 'sortable-ghost', // 드래그 중 스타일
      chosenClass: 'sortable-chosen', // 선택된 요소 스타일
      dragClass: 'sortable-drag', // 드래그되는 요소 스타일

      onEnd: async (event) => {
        await this.updateOrder();
      },
    });
  }

  async updateOrder() {
    // 현재 화면의 모든 아이템 순서를 서버로 전송
    const newOrders = Array.from(this.containerTarget.children).map(
      (item, index) => ({
        id: parseInt(item.dataset.id),
        order: index + 1,
      }),
    );

    await fetch(this.orderApiValue, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: newOrders }),
    });

    Turbo.visit('/admin/categories');
  }

  disconnect() {
    if (this.sortable) {
      this.sortable.destroy();
    }
  }
}
