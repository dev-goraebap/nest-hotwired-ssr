import { application } from './application';

import { DocumentFormController } from './admin/documents/form.controller';
import { HelloWorldController } from './hello_world_controller';
import { ModalController } from './modal.controller';
import { TinyMceController } from './tiny-mce.controller';

application.register('hello', HelloWorldController);
application.register('tiny-mce', TinyMceController);
application.register('modal', ModalController);
application.register('document-form', DocumentFormController);
