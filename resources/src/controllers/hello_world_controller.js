import { Controller } from "@hotwired/stimulus";

export class HelloWorldController extends Controller {
  connect() {
    console.log(this.element);
  }
}
