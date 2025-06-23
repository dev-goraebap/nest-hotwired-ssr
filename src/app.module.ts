import { Module } from '@nestjs/common';
import { HomeController } from './controllers/home.controller';

@Module({
  imports: [],
  controllers: [
    HomeController
  ]
})
export class AppModule {}
