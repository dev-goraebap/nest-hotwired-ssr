import { Controller } from "@hotwired/stimulus";

export class SsrModalController extends Controller {

  static targets = ["closeBtn","backdrop"];

  connect() {
    console.log(this.element);
  }

  onBackdropClose(e) {
    if (this.backdropTarget !== e.target) {
      return;
    }
    this.element.remove();
  }

  onClose() {
    this.element.remove();
  }
}
