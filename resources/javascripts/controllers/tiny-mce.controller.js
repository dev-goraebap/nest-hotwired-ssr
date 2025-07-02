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
      ],
      toolbar:
        'undo redo | blocks | bold italic | link image media table | numlist bullist | emoticons | removeformat',
      resize: true,
      min_height: 300,
      statusbar: false,
      menubar: false,
      branding: false,
      skin: 'oxide',
      setup: function (editor) {
        editor.on('change', function () {
          const hiddenField = document.getElementById('policy_content_hidden');
          if (hiddenField) hiddenField.value = editor.getContent();
        });
        editor.on('init', function () {
          console.log('TinyMCE 초기화 완료');
        });
      },
    });
  }
}
