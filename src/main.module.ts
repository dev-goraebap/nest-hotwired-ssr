import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { I18nModule } from 'nestjs-i18n';
import { NestMvcCoreModule } from 'nestjs-mvc-tools';

import { AppModule } from './app/app.module';
import { configOptions } from './config/config.options';
import { i18nOptions } from './config/i18n.options';
import { NestjsMvcToolsOptionsImpl } from './config/nestjs-mvc-tools.options';
import { TypeormActiveStorageOptionsImpl } from './config/typeorm-active-storage.options';
import { TypeOrmOptionsImpl } from './config/typeorm.options';
import { TypeormActiveStorageModule } from './libs/typeorm-active-storage';
import { SharedModule } from './shared';

@Module({
  imports: [
    ConfigModule.forRoot(configOptions),
    I18nModule.forRoot(i18nOptions),
    NestMvcCoreModule.forRootAsync({ useClass: NestjsMvcToolsOptionsImpl }),
    TypeOrmModule.forRootAsync({ useClass: TypeOrmOptionsImpl }),
    TypeormActiveStorageModule.forRootAsync({
      useClass: TypeormActiveStorageOptionsImpl,
    }),
    SharedModule,
    AppModule,
  ],
})
export class MainModule {}
