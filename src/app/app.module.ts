import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NestMvcCoreModule } from 'nestjs-mvc-tools';
import { join } from 'path';

import { GoogleVisionConfig } from 'src/config/google-vision.config';
import { TypeormActiveStorageConfig } from 'src/config/typeorm-active-storage.config';
import { TypeOrmConfig } from 'src/config/typeorm.config';
import { GoogleVisionModule } from 'src/shared/google-vision';
import { TypeormActiveStorageModule } from 'src/shared/typeorm-active-storage';

import { AdminController } from './controllers/admin.controller';
import { AdminCategoriesController } from './controllers/admin/categories.controller';
import { AdminDocumentsController } from './controllers/admin/documents.controller';
import { DocumentsController } from './controllers/documents.controller';
import { ErrorsController } from './controllers/errors.controller';
import { HomeController } from './controllers/home.controller';
import { FileUploadExample01Controller } from './controllers/lab/file-upload-example-01.controller';
import { FileUploadExample02Controller } from './controllers/lab/file-upload-example-02.controller';
import { FlashExample01Controller } from './controllers/lab/flash-example-01.controller';
import { FlashExample02Controller } from './controllers/lab/flash-example-02.controller';
import { ModalExample01Controller } from './controllers/lab/modal-example-01.controller';
import { ModalExample02Controller } from './controllers/lab/modal-example-02.controller';
import { ModalExample03Controller } from './controllers/lab/modal-example-03.controller';
import { ThemeSwitcherExampleController } from './controllers/lab/theme-switcher-example.controller';
import { CategoryEntity } from './entities/category.entity';
import { DocumentEntity } from './entities/document.entity';
import { GlobalStatesInterceptor } from './interceptors/global-states.interceptor';
import { CategoriesService } from './services/categories.service';
import { DocumentsService } from './services/documents.service';

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
    NestMvcCoreModule.forRoot({
      debug: true
    }),
    GoogleVisionModule.forRootAsync({
      useClass: GoogleVisionConfig,
    }),
    TypeOrmModule.forFeature([DocumentEntity, CategoryEntity]),
  ],
  controllers: [
    HomeController,
    ModalExample01Controller,
    ModalExample02Controller,
    ModalExample03Controller,
    FlashExample01Controller,
    FlashExample02Controller,
    ThemeSwitcherExampleController,
    FileUploadExample01Controller,
    FileUploadExample02Controller,
    DocumentsController,
    ErrorsController,
    AdminController,
    AdminDocumentsController,
    AdminCategoriesController
  ],
  providers: [
    CategoriesService,
    DocumentsService,
    {
      provide: APP_INTERCEPTOR,
      useClass: GlobalStatesInterceptor
    },
  ],
})
export class AppModule {}
