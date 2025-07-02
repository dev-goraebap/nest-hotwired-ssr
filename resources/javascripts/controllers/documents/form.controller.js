import { Controller } from '@hotwired/stimulus';

export class DocumentFormController extends Controller {
  static targets = ['categoryIdTemplate'];

  connect() {
    console.log(this.element);
  }

  selectCategory(e) {
    const id = e.currentTarget.dataset.id;
    if (!id) {
      throw new Error('아이디 없음');
    }
    console.log('카테고리 선택');
    console.log(this.categoryIdTemplateTarget);
    const template = this.categoryIdTemplateTarget.content.cloneNode(true);
    console.log();
    const input = template.querySelector('input');
    input.value = id;
    this.element.appendChild(input);
  }
}
