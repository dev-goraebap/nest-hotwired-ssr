import { Controller } from '@hotwired/stimulus';

export class TinyMceController extends Controller {
  connect() {
    // 이미 인스턴스가 있으면 초기화하지 않음
    if (typeof tinymce !== 'undefined' && tinymce.get('tinyMceEditor')) {
      throw new Error('Tiny 인스턴스 생성 오류');
    }
    // TinyMCE가 이미 전역에 로드되어 있다고 가정하고 바로 초기화
    this.initEditor();
  }

  initEditor() {
    tinymce.init({
      selector: '#tinyMceEditor',
      // 핵심 플러그인만 로드하여 초기화 속도 향상
      plugins: [
        'anchor',
        'autolink',
        'charmap',
        'link',
        'lists',
        'image',
        'media',
        'table',
        'emoticons',
        'code', // 소스코드 보기 플러그인 추가
      ],
      // 간소화된 툴바
      toolbar:
        'undo redo | blocks | bold italic | link image media table | numlist bullist | emoticons | removeformat | code', // code 버튼 추가
      // 로딩 성능 개선을 위한 설정
      skin: 'oxide',
      resize: true,
      min_height: 300,
      statusbar: false,
      menubar: false,
      branding: false,
      // 성능 개선을 위한 설정
      setup: function (editor) {
        editor.on('change', function () {
          // hidden 필드에 내용 동기화
          const hiddenField = document.getElementById('content_hidden');
          if (hiddenField) hiddenField.value = editor.getContent();
        });

        // 초기화 완료 시 이벤트
        editor.on('init', function () {
          console.log('TinyMCE 초기화 완료');
        });
      },
    });
  }
}
