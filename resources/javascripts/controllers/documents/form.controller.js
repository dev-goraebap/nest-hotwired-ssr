import { Controller } from '@hotwired/stimulus';

export class DocumentFormController extends Controller {
  static targets = ['categoryIdTemplate', 'categoryContainer'];

  connect() {
    console.log(this.element);
  }

  selectCategory(e) {
    const id = e.currentTarget.dataset.id;
    const name = e.currentTarget.dataset.name;
    if (!id || !name) {
      alert('카테고리 정보가 없습니다.');
      return;
    }

    // 기존 카테고리 input이 있으면 먼저 제거
    const oldInput = this.element.querySelector('input[name="categoryId"]');
    if (oldInput) oldInput.remove();

    // 기존 카테고리 이름 badge가 있으면 제거
    const oldBadge = this.element.querySelector('.badge');
    if (oldBadge) oldBadge.remove();

    // 템플릿 복제 및 값 주입
    const template = this.categoryIdTemplateTarget.content.cloneNode(true);
    const input = template.querySelector('input[name="categoryId"]');
    if (input) input.value = id;

    // 카테고리 이름 badge 생성 및 추가
    const badge = template.querySelector('.badge');
    if (badge) badge.textContent = name;

    this.categoryContainerTarget.appendChild(template);
  }
}
