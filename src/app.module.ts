import { Module } from '@nestjs/common';
import { HomeController } from './controllers/home.controller';
import { LabController } from './controllers/lab.controller';
import { ModalExampleController } from './controllers/lab/modal-example.controller';

@Module({
  imports: [],
  controllers: [
    HomeController,
    LabController,
    ModalExampleController
  ]
})
export class AppModule {}
