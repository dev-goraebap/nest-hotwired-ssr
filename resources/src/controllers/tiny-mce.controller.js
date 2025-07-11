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

  disconnect() {
    tinymce.remove();
  }

  initEditor() {
    tinymce.init({
      selector: '#tinyMceEditor',
      placeholder:
        '여기에 내용을 입력하세요. (처음 작성한 h1 태그가 제목으로 자동 입력됩니다)',
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
          const content = editor.getContent();
          // hidden 필드에 내용 동기화
          const hiddenField = document.getElementById('content_hidden');
          if (hiddenField) hiddenField.value = content;

          // 첫 번째 h1의 텍스트를 title input에 자동 입력
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = content;
          const firstH1 = tempDiv.querySelector('h1');
          if (firstH1) {
            const titleInput = document.querySelector(
              'input[name="document[title]"]',
            );
            if (titleInput) titleInput.value = firstH1.textContent.trim();
          }
        });

        // 초기화 완료 시 이벤트
        editor.on('init', function () {
          console.debug('TinyMCE 초기화 완료');
        });
      },
    });
  }
}
