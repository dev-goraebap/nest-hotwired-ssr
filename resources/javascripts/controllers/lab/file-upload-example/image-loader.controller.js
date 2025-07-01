import { Controller } from "@hotwired/stimulus";

export class ImageLoaderController extends Controller {
  static targets = ["image"];

  connect() {
    // 이미지 로드 이벤트 리스너 설정
    this.imageTarget.addEventListener("load", this.onImageLoaded.bind(this));

    // 이미지가 이미 캐시되어 있는 경우 처리
    if (this.imageTarget.complete) {
      this.onImageLoaded();
    }
  }

  onImageLoaded() {
    // 이미지가 로드되면 페이드인 효과 적용
    this.imageTarget.classList.add("opacity-100");
  }
}
