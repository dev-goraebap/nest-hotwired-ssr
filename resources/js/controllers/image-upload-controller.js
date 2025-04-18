import { Controller } from '/js/stimulus@3.2.2.min.js';

export default class ImageUploadController extends Controller {
  static targets = ['dropArea', 'fileInput', 'preview', 'imagePreview'];

  connect() {
    console.log('ImageUpload controller connected');
    this.addEventListeners();
  }

  disconnect() {
    this.removeEventListeners();
  }

  // 드롭 영역 클릭 시 파일 선택 다이얼로그 열기
  browse(event) {
    event.preventDefault();
    this.fileInputTarget.click();
  }

  // 파일 선택 시 미리보기 표시
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

  // 드래그 앤 드롭 이벤트 처리 메서드
  highlight() {
    this.dropAreaTarget.classList.add('border-blue-500', 'bg-blue-50');
  }

  unhighlight() {
    this.dropAreaTarget.classList.remove('bg-blue-50');
    if (!this.fileInputTarget.files || !this.fileInputTarget.files[0]) {
      this.dropAreaTarget.classList.remove('border-blue-500');
    }
  }

  handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    this.unhighlight();

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      this.fileInputTarget.files = e.dataTransfer.files;
      this.preview();
    }
  }

  // 이벤트 리스너 관리
  addEventListeners() {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach((eventName) => {
      this.dropAreaTarget.addEventListener(
        eventName,
        this.preventDefaults.bind(this),
        false,
      );
    });
  }

  removeEventListeners() {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach((eventName) => {
      this.dropAreaTarget.removeEventListener(
        eventName,
        this.preventDefaults.bind(this),
        false,
      );
    });
  }

  preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }
}
