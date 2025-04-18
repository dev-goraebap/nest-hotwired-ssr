import { Controller } from '/js/stimulus@3.2.2.min.js';

export default class ModalController extends Controller {
  static targets = ["container", "background", "content"];
  
  connect() {
    console.log("Modal controller connected");
  }
  
  open(event) {
    event.preventDefault();
    
    // 삭제할 항목의 ID와 링크를 가져옴
    if (event.currentTarget.dataset.id && event.currentTarget.href) {
      this.deleteId = event.currentTarget.dataset.id;
      this.deleteUrl = event.currentTarget.href;
    }
    
    this.containerTarget.classList.remove("hidden");
    
    // 애니메이션 효과
    setTimeout(() => {
      this.backgroundTarget.classList.add("opacity-50");
      this.contentTarget.classList.add("opacity-100", "translate-y-0");
    }, 10);
    
    // 본문 스크롤 방지
    document.body.style.overflow = "hidden";
  }
  
  close() {
    // 애니메이션 효과
    this.backgroundTarget.classList.remove("opacity-50");
    this.contentTarget.classList.remove("opacity-100", "translate-y-0");
    
    setTimeout(() => {
      this.containerTarget.classList.add("hidden");
      // 본문 스크롤 재개
      document.body.style.overflow = "auto";
    }, 300);
  }
  
  confirm() {
    if (this.deleteUrl) {
      window.location.href = this.deleteUrl;
    }
  }
  
  // 배경 클릭 시 모달 닫기
  backgroundClick(event) {
    if (event.target === this.backgroundTarget) {
      this.close();
    }
  }
  
  // ESC 키 누를 시 모달 닫기
  keydown(event) {
    if (event.key === "Escape") {
      this.close();
    }
  }
}