import { Module } from '@nestjs/common';
import { HomeController } from './controllers/home.controller';
import { ModalExample01Controller } from './controllers/lab/modal-example-01.controller';
import { ModalExample02Controller } from './controllers/lab/modal-example-02.controller';

@Module({
  imports: [],
  controllers: [
    HomeController,
    ModalExample01Controller,
    ModalExample02Controller
  ]
})
export class AppModule {}
