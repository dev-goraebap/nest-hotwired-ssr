import Sortable from 'https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/+esm';
import { Controller } from '/js/stimulus@3.2.2.min.js';

export default class extends Controller {
  static targets = ["container", "item"];  // item target 추가
  
  connect() {
    console.log("Sortable controller connected");
    this.initSortable();
  }
  
  initSortable() {
    const container = this.containerTarget;
    const self = this;
    
    this.sortable = new Sortable(container, {
      animation: 150,
      ghostClass: 'bg-gray-100',
      handle: '.drag-handle', // 드래그 핸들 클래스
      onEnd: function(evt) {
        self.updateOrder();
      }
    });
  }
  
  updateOrder() {
    // item targets 사용하여 요소들 가져오기
    const items = this.itemTargets;
    const orders = [];
    
    console.log(`업데이트할 아이템 수: ${items.length}`);
    
    // 각 요소의 새 순서 수집
    items.forEach((item, index) => {
      if (item.dataset.id) {
        const id = parseInt(item.dataset.id);
        orders.push({
          id: id,
          order: index + 1
        });
        console.log(`아이템 ID: ${id}, 새 순서: ${index + 1}`);
      }
    });
    
    console.log('전송할 데이터:', JSON.stringify({ orders }));
    
    // 서버에 순서 업데이트 요청
    fetch('/admin/banners/update-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ orders })
    })
    .then(response => {
      console.log('서버 응답 상태:', response.status);
      return response.json();
    })
    .then(data => {
      if (data.success) {
        console.log('순서가 업데이트되었습니다.');
        
        // 화면에 표시된 순서 번호 업데이트
        items.forEach((item, index) => {
          const orderBadge = item.querySelector('.order-badge');
          if (orderBadge) {
            orderBadge.textContent = index + 1;
          }
        });
      } else {
        console.error('순서 업데이트 실패:', data.error);
      }
    })
    .catch(error => {
      console.error('순서 업데이트 요청 실패:', error);
    });
  }
}