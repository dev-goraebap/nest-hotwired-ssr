import { Module } from '@nestjs/common';
import { HomeController } from './controllers/home.controller';
import { LabController } from './controllers/lab.controller';

@Module({
  imports: [],
  controllers: [
    HomeController,
    LabController
  ]
})
export class AppModule {}
