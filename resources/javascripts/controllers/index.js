import { application } from "./application";
import { HelloController } from "./hello.controller";
import { CsrModalController } from "./modal/csr-modal.controller";
import { SsrModalController } from "./modal/ssr-modal.controller";

application.register("hello", HelloController);
application.register("csr-modal", CsrModalController);
application.register("ssr-modal", SsrModalController);