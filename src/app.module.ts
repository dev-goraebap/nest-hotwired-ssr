import { Module } from '@nestjs/common';
import { HomeController } from './controllers/home.controller';
import { ModalExampleController } from './controllers/lab/modal-example.controller';

@Module({
  imports: [],
  controllers: [
    HomeController,
    ModalExampleController
  ]
})
export class AppModule {}
