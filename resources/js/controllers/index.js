import { Application } from '/js/stimulus@3.2.2.min.js';
import ImageUploadController from './image-upload-controller.js';
import FlashMessageController from './flash-message-controller.js';
import ModalController from './modal-controller.js';
import DragDropController from './drag-drop-controller.js';

// Stimulus 애플리케이션 시작
window.StimulusApp = Application.start();

// 컨트롤러 등록
window.StimulusApp.register("image-upload", ImageUploadController);
window.StimulusApp.register("flash-message", FlashMessageController);
window.StimulusApp.register("modal", ModalController);
window.StimulusApp.register("drag-drop", DragDropController);