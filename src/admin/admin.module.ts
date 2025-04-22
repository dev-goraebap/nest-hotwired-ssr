import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AppVersionController } from "./controllers/app-version.controller";
import { BannerController } from "./controllers/banner.controller";
import { DrNoticeController } from "./controllers/dr-notice.controller";
import { AppVersionEntity } from "./entities/app-version.entity";
import { BannerEntity } from "./entities/banner.entity";
import { AppVersionService } from "./services/app-version.service";
import { BannerService } from "./services/banner.service";
@Module({
  imports: [
    TypeOrmModule.forFeature([
      BannerEntity,
      AppVersionEntity
    ])
  ],
  controllers: [
    AppVersionController,
    BannerController,
    DrNoticeController
  ],
  providers: [
    BannerService,
    AppVersionService
  ],
})
export class AdminModule {}