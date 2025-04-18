import { Controller } from '/js/stimulus@3.2.2.min.js';

export default class FlashMessageController extends Controller {
  // connect() {
  //   // 연결 시 3초 후에 자동으로 닫히도록 설정
  //   this.timeout = setTimeout(() => {
  //     this.close();
  //   }, 3000);
  // }

  // disconnect() {
  //   // 컨트롤러 연결 해제 시 타임아웃 정리
  //   if (this.timeout) {
  //     clearTimeout(this.timeout);
  //   }
  // }

  close() {
    // 닫기 버튼 클릭 시 요소 제거
    this.element.classList.add('opacity-0');
    
    // 애니메이션 효과를 위해 약간의 딜레이 후 요소 제거
    setTimeout(() => {
      this.element.remove();
    }, 300);
  }
}