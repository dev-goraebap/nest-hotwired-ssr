import { Module } from "@nestjs/common";

import { BannerController } from "./banner.controller";
import { VersionController } from "./version.controller";
import { DrNoticeController } from "./dr-notice.controller";

@Module({
  imports: [],
  controllers: [
    VersionController,
    BannerController,
    DrNoticeController
  ],
})
export class AdminModule {}