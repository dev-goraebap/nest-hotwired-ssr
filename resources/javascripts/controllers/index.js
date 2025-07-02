import { application } from './application';
import { DocumentFormController } from './documents/form.controller';
import { ImageLoaderController } from './lab/file-upload-example/image-loader.controller';
import { FlashController as Flash02Controller } from './lab/flash-example-02/flash.controller';
import { ModalController as Modal01Controller } from './lab/modal-example-01/modal.controller';
import { ModalController as Modal03Controller } from './lab/modal-example-03/modal.controller';
import { ThemeSwitcherController } from './lab/theme-switcher-example/theme-switcher.controller';
import { TinyMceController } from './tiny-mce.controller';

application.register('modal-01', Modal01Controller);
application.register('modal-03', Modal03Controller);
application.register('flash-02', Flash02Controller);
application.register('theme-switcher', ThemeSwitcherController);
application.register('image-loader', ImageLoaderController);
application.register('tiny-mce', TinyMceController);
application.register('document-form', DocumentFormController);
