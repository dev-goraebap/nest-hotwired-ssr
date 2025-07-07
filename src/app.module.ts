import { Module } from '@nestjs/common';
import { NestMvcCoreModule } from "nestjs-mvc-tools";

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [NestMvcCoreModule.forRoot()],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
