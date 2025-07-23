import { application } from './application';

import { DocumentFormController } from './admin/documents/form.controller';
import { TagInputController } from './admin/posts/tag-input-controller';
import { FlashController } from './flash.controller';
import { HelloWorldController } from './hello_world_controller';
import { LanguageSwitcherController } from './language_switcher_controller';
import { ModalController } from './modal.controller';
import { SortableController } from './sortable_controller';
import { ThemeSwitcherController } from './theme_switcher_controller';
import { TinyMceController } from './tiny-mce.controller';

application.register('hello', HelloWorldController);
application.register('tiny-mce', TinyMceController);
application.register('modal', ModalController);
application.register('document-form', DocumentFormController);
application.register('flash', FlashController);
application.register('sortable', SortableController);
application.register('theme-switcher', ThemeSwitcherController);
application.register('language-switcher', LanguageSwitcherController);
application.register('tag-input', TagInputController);
