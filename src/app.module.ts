import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HomeController } from './controllers/home.controller';
import { FileUploadExampleController } from './controllers/lab/file-upload-example-01.controller';
import { FlashExample01Controller } from './controllers/lab/flash-example-01.controller';
import { FlashExample02Controller } from './controllers/lab/flash-example-02.controller';
import { ModalExample01Controller } from './controllers/lab/modal-example-01.controller';
import { ModalExample02Controller } from './controllers/lab/modal-example-02.controller';
import { ModalExample03Controller } from './controllers/lab/modal-example-03.controller';
import { ThemeSwitcherExampleController } from './controllers/lab/theme-switcher-example.controller';

import { ConfigModule, TypeOrmConfig } from './config';
import { EdgeJsModule } from './shared/edge-js';
import { TypeormActiveStorageModule } from './shared/typeorm-active-storage';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfig,
    }),
    TypeormActiveStorageModule.forRoot(),
    EdgeJsModule.forRootAsync(),
  ],
  controllers: [
    HomeController,
    ModalExample01Controller,
    ModalExample02Controller,
    ModalExample03Controller,
    FlashExample01Controller,
    FlashExample02Controller,
    ThemeSwitcherExampleController,
    FileUploadExampleController,
  ],
})
export class AppModule {}
