import { Controller } from '@hotwired/stimulus';

export class HelloController extends Controller {
  connect() {
    console.log(this.element);
  }
}
