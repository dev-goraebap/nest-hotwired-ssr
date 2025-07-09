import { Controller } from '@hotwired/stimulus';

export class ModalController extends Controller {
  static targets = ['modalOverlay', 'modalContent', 'modalTemplate'];

  onOpen(e) {
    const template = this.modalTemplateTarget.content.cloneNode(true);
    this.element.appendChild(template);
    const url = this.#getUrl(e);
    console.log(url);
    this.#render(url);
  }

  onClose() {
    this.modalOverlayTarget.remove();
  }

  #render(url) {
    const modalContentFrame = document.getElementById('modalContentFrame');
    console.log(modalContentFrame);
    modalContentFrame.src = url;
  }

  #getUrl(event) {
    const url = event.target.dataset.url;
    if (!url) {
      throw new Error("url이 누락되었습니다.");
    }
    return url;
  }
}
