import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';

import { HomeController } from './controllers/home.controller';
import { FileUploadExampleController } from './controllers/lab/file-upload-example-01.controller';
import { FlashExample01Controller } from './controllers/lab/flash-example-01.controller';
import { FlashExample02Controller } from './controllers/lab/flash-example-02.controller';
import { ModalExample01Controller } from './controllers/lab/modal-example-01.controller';
import { ModalExample02Controller } from './controllers/lab/modal-example-02.controller';
import { ModalExample03Controller } from './controllers/lab/modal-example-03.controller';
import { ThemeSwitcherExampleController } from './controllers/lab/theme-switcher-example.controller';

import { EdgeInNestConfig } from 'src/config/edge-in-nest.config';
import { TypeormActiveStorageConfig } from 'src/config/typeorm-active-storage.config';
import { TypeOrmConfig } from 'src/config/typeorm.config';
import { EdgeInNestModule } from 'src/shared/edge-in-nest';
import { TypeormActiveStorageModule } from 'src/shared/typeorm-active-storage';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(process.cwd(), `.env.${process.env.NODE_ENV}.local`),
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfig,
    }),
    TypeormActiveStorageModule.forRootAsync({
      useClass: TypeormActiveStorageConfig,
    }),
    EdgeInNestModule.forRootAsync({
      useClass: EdgeInNestConfig,
    }),
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
