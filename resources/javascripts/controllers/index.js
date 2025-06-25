import { application } from "./application";
import { HelloController } from "./hello.controller";
import { ModalController as Modal01Controller } from "./lab/modal-example-01/modal.controller";
import { CsrModalController } from "./modal/csr-modal.controller";
import { SsrModalController } from "./modal/ssr-modal.controller";

application.register("hello", HelloController);
application.register("modal-01", Modal01Controller);
application.register("csr-modal", CsrModalController);
application.register("ssr-modal", SsrModalController);