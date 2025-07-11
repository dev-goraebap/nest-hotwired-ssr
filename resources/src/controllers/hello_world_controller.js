import { Controller } from "@hotwired/stimulus";

export class HelloWorldController extends Controller {
  connect() {
    console.debug(this.element);
  }
}
