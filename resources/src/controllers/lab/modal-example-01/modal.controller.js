import { Controller } from '@hotwired/stimulus';

export class ModalController extends Controller {
  static targets = ['modalOverlay', 'modalContent'];

  static values = {
    url: String, // 모달 내부에 데이터를 그리기 위해 가져올 데이터의 api
  };

  async onOpen() {
    this.modalOverlayTarget.classList.remove('hidden');
    this.modalOverlayTarget.classList.add('flex');
    await this.#render();
  }

  onClose() {
    this.modalOverlayTarget.classList.remove('flex');
    this.modalOverlayTarget.classList.add('hidden');
  }

  async #render() {
    // 데이터 요청
    const res = await fetch(this.urlValue);
    if (!res.ok) {
      throw new Error('요청 실패');
    }
    const data = await res.json();

    // 데이터를 알맞은 dom에 그리기
    const { title, content } = data;
    this.modalContentTarget.innerHTML = `
    <h2 class="text-2xl">${title}</h2>
    <p>${content}</p>
    `;
  }
}
