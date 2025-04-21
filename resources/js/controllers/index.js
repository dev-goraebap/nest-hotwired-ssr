/**
 * Stimulus 컨트롤러 등록 파일
 * 애플리케이션에서 사용할 모든 컨트롤러를 여기서 등록합니다.
 */

// Stimulus 프레임워크에서 Application 클래스 가져오기
import { Application } from '/js/stimulus@3.2.2.min.js';

// 컨트롤러 파일 가져오기
import ImageUploadController from './image-upload-controller.js'; // 이미지 업로드/미리보기 기능
import FlashMessageController from './flash-message-controller.js'; // 알림 메시지 표시 기능
import ModalController from './modal-controller.js'; // 모달 대화상자 기능
import DragDropController from './drag-drop-controller.js'; // 드래그 앤 드롭으로 순서 변경 기능

/**
 * Stimulus 애플리케이션 초기화
 * 모든 컨트롤러가 HTML에서 동작하기 위해 필요한 시작점
 */
window.StimulusApp = Application.start();

/**
 * 컨트롤러 등록
 * 각 컨트롤러를 HTML에서 data-controller 속성으로 참조할 수 있도록 등록
 *
 * 사용 예시:
 * 1. 이미지 업로드: <div data-controller="image-upload">...</div>
 * 2. 알림 메시지: <div data-controller="flash-message">...</div>
 * 3. 모달: <div data-controller="modal">...</div>
 * 4. 드래그 앤 드롭: <div data-controller="drag-drop">...</div>
 */
window.StimulusApp.register('image-upload', ImageUploadController);
window.StimulusApp.register('flash-message', FlashMessageController);
window.StimulusApp.register('modal', ModalController);
window.StimulusApp.register('drag-drop', DragDropController);
