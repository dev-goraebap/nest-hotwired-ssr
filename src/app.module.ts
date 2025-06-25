import { Module } from '@nestjs/common';
import { HomeController } from './controllers/home.controller';
import { FlashExample01Controller } from './controllers/lab/flash-example-01.controller';
import { ModalExample01Controller } from './controllers/lab/modal-example-01.controller';
import { ModalExample02Controller } from './controllers/lab/modal-example-02.controller';
import { ModalExample03Controller } from './controllers/lab/modal-example-03.controller';

@Module({
  imports: [],
  controllers: [
    HomeController,
    ModalExample01Controller,
    ModalExample02Controller,
    ModalExample03Controller,
    FlashExample01Controller
  ]
})
export class AppModule {}
