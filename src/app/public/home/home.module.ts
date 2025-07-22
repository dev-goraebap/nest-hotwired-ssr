import { Module } from '@nestjs/common';
import { PublicHomeController } from './home.controller';

@Module({
  controllers: [PublicHomeController],
})
export class PublicHomeModule {}
