import { application } from "./application";
import { HelloController } from "./hello.controller";

application.register("hello", HelloController);