import { Controller } from "@hotwired/stimulus";

export class CsrModalController extends Controller {
  static targets = ["modalFrame", "backdrop"];

  static values = {
    api: String,
  };

  connect() {
    console.log(this.element);
  }

  onOpen(event) {
    const modalTemplate = document.getElementById("modal_template");
    const modalEl = modalTemplate.content.cloneNode(true);
    this.modalFrameTarget.appendChild(modalEl);
    
    const api = this.#getApi(event);
    const modalContentFrame = document.getElementById('modal_content_frame');
    modalContentFrame.src = api;
  }

  onBackdropClose(e) {
    if (this.backdropTarget !== e.target) {
      return;
    }
    this.modalFrameTarget.innerHTML = "";
  }

  onClose() {
    // while (this.modalFrameTarget.firstChild) {
    //   this.modalFrameTarget.removeChild(this.modalFrameTarget.firstChild);
    // }
    this.modalFrameTarget.innerHTML = "";
  }

  #getApi(event) {
    const api = event.target.dataset.api;
    if (!api) {
      throw new Error("api가 누락되었습니다.");
    }
    return api;
  }
}
