import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AppVersionController } from "./controllers/app-version.controller";
import { BannerController } from "./controllers/banner.controller";
import { DrNoticeController } from "./controllers/dr-notice.controller";
import { IpWhitelistController } from "./controllers/ip-whitelist.controller";
import { LogViewerController } from "./controllers/log-viewer.controller";
import { AppVersionEntity } from "./entities/app-version.entity";
import { BannerEntity } from "./entities/banner.entity";
import { IpWhitelistEntity } from "./entities/ip-whitelist.entity";
import { AppVersionService } from "./services/app-version.service";
import { BannerService } from "./services/banner.service";
import { IpWhitelistService } from "./services/ip-whitelist.service";
import { LogViewerService } from "./services/log-viewer.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BannerEntity,
      AppVersionEntity,
      IpWhitelistEntity
    ])
  ],
  controllers: [
    BannerController,
    DrNoticeController,
    AppVersionController,
    LogViewerController,
    IpWhitelistController
  ],
  providers: [
    BannerService,
    AppVersionService,
    LogViewerService,
    IpWhitelistService
  ],
})
export class AdminModule {}