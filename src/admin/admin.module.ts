import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AppVersionController } from "./controllers/app-version.controller";
import { BannerController } from "./controllers/banner.controller";
import { DrNoticeController } from "./controllers/dr-notice.controller";
import { LogViewerController } from "./controllers/log-viewer.controller";
import { AppVersionEntity } from "./entities/app-version.entity";
import { BannerEntity } from "./entities/banner.entity";
import { AppVersionService } from "./services/app-version.service";
import { BannerService } from "./services/banner.service";
import { LogViewerService } from "./services/log-viewer.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BannerEntity,
      AppVersionEntity
    ])
  ],
  controllers: [
    BannerController,
    DrNoticeController,
    AppVersionController,
    LogViewerController
  ],
  providers: [
    BannerService,
    AppVersionService,
    LogViewerService
  ],
})
export class AdminModule {}