import { Controller } from '/public/js/stimulus@3.2.2.min.js';

/**
 * 이미지 업로드 및 드래그 앤 드롭 기능을 제어하는 Stimulus 컨트롤러
 * 파일 선택 및 미리보기 기능을 담당
 */
export default class ImageUploadController extends Controller {
  static targets = ['dropArea', 'fileInput', 'preview', 'imagePreview'];

  // ------------------------------------------------------------
  // 1. 라이프사이클 콜백 (Stimulus에 의해 자동 호출)
  // ------------------------------------------------------------

  /**
   * 컨트롤러가 DOM에 연결될 때 호출됨
   */
  connect() {
    console.log('ImageUpload controller connected');
    this.addEventListeners();
  }

  /**
   * 컨트롤러가 DOM에서 분리될 때 호출됨
   */
  disconnect() {
    this.removeEventListeners();
  }

  // ------------------------------------------------------------
  // 3. HTML에서 직접 호출하는 액션 메서드 (data-action 속성으로 연결)
  // ------------------------------------------------------------

  /**
   * 드롭 영역 클릭 시 파일 선택 다이얼로그 열기
   * HTML에서 data-action="image-upload#browse"로 호출
   */
  browse(event) {
    event.preventDefault();
    this.fileInputTarget.click();
  }

  /**
   * 파일 선택 시 미리보기 표시
   * HTML에서 data-action="image-upload#preview"로 호출
   */
  preview() {
    if (this.fileInputTarget.files && this.fileInputTarget.files[0]) {
      const reader = new FileReader();

      reader.onload = (e) => {
        this.imagePreviewTarget.src = e.target.result;
        this.previewTarget.classList.remove('hidden');
        this.dropAreaTarget.classList.add('border-blue-500');
      };

      reader.readAsDataURL(this.fileInputTarget.files[0]);
    }
  }

  // ------------------------------------------------------------
  // 4. 내부 이벤트 핸들러 (각 아이템에 이벤트 리스너로 등록됨)
  // ------------------------------------------------------------

  /**
   * 드래그 영역에 드래그 진입/오버 시 하이라이트 효과 적용
   */
  highlight() {
    this.dropAreaTarget.classList.add('border-blue-500', 'bg-blue-50');
  }

  /**
   * 드래그 영역에서 드래그 나가거나 드롭 완료 시 하이라이트 효과 제거
   */
  unhighlight() {
    this.dropAreaTarget.classList.remove('bg-blue-50');
    if (!this.fileInputTarget.files || !this.fileInputTarget.files[0]) {
      this.dropAreaTarget.classList.remove('border-blue-500');
    }
  }

  /**
   * 파일이 드롭되었을 때 처리
   */
  handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    this.unhighlight();

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      this.fileInputTarget.files = e.dataTransfer.files;
      this.preview();
    }
  }

  /**
   * 기본 이벤트 동작 방지 (드래그 앤 드롭 관련)
   */
  preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  // ------------------------------------------------------------
  // 5. 내부 유틸리티 메서드 (컨트롤러 내에서만 사용)
  // ------------------------------------------------------------

  /**
   * 드래그 앤 드롭 관련 이벤트 리스너 등록
   * @private
   */
  addEventListeners() {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach((eventName) => {
      this.dropAreaTarget.addEventListener(
        eventName,
        this.preventDefaults.bind(this),
        false,
      );
    });

    // 드래그 이벤트 맵핑
    this.dropAreaTarget.addEventListener(
      'dragenter',
      this.highlight.bind(this),
      false,
    );
    this.dropAreaTarget.addEventListener(
      'dragover',
      this.highlight.bind(this),
      false,
    );
    this.dropAreaTarget.addEventListener(
      'dragleave',
      this.unhighlight.bind(this),
      false,
    );
    this.dropAreaTarget.addEventListener(
      'drop',
      this.handleDrop.bind(this),
      false,
    );
  }

  /**
   * 등록된 이벤트 리스너 제거 (메모리 누수 방지)
   * @private
   */
  removeEventListeners() {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach((eventName) => {
      this.dropAreaTarget.removeEventListener(
        eventName,
        this.preventDefaults.bind(this),
        false,
      );
    });

    // 드래그 이벤트 리스너 제거
    this.dropAreaTarget.removeEventListener(
      'dragenter',
      this.highlight.bind(this),
      false,
    );
    this.dropAreaTarget.removeEventListener(
      'dragover',
      this.highlight.bind(this),
      false,
    );
    this.dropAreaTarget.removeEventListener(
      'dragleave',
      this.unhighlight.bind(this),
      false,
    );
    this.dropAreaTarget.removeEventListener(
      'drop',
      this.handleDrop.bind(this),
      false,
    );
  }
}
