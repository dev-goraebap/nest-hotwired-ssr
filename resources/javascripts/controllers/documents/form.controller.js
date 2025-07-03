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

    this.categoryContainerTarget.innerHTML = '';

    // 템플릿 복제 및 값 주입
    const template = this.categoryIdTemplateTarget.content.cloneNode(true);
    const categoryIdInput = template.querySelector('input[name="document[category][id]"]');
    const categoryNameInput = template.querySelector('input[name="document[category][name]"]');
    const badge = template.querySelector('.badge');
    if (categoryIdInput) categoryIdInput.value = id;
    if (categoryNameInput) categoryNameInput.value = name;
    if (badge) badge.textContent = name;

    this.categoryContainerTarget.appendChild(template);
  }
}
