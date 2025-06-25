import { Module } from '@nestjs/common';
import { HomeController } from './controllers/home.controller';
import { ModalExample01Controller } from './controllers/lab/modal-example-01.controller';
import { ModalExampleController } from './controllers/lab/modal-example.controller';

@Module({
  imports: [],
  controllers: [
    HomeController,
    ModalExample01Controller,
    ModalExampleController
  ]
})
export class AppModule {}
