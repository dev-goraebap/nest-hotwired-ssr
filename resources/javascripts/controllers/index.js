import { application } from "./application";
import { ModalController as Modal01Controller } from "./lab/modal-example-01/modal.controller";
import { ModalController as Modal03Controller } from "./lab/modal-example-03/modal.controller";

application.register("modal-01", Modal01Controller);
application.register("modal-03", Modal03Controller);