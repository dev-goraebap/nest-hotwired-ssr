import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { BannerController } from "./controllers/banner.controller";
import { DrNoticeController } from "./controllers/dr-notice.controller";
import { BannerEntity } from "./entities/banner.entity";
import { BannerService } from "./services/banner.service";
import { VersionController } from "./version.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BannerEntity
    ])
  ],
  controllers: [
    VersionController,
    BannerController,
    DrNoticeController
  ],
  providers: [
    BannerService
  ],
})
export class AdminModule {}