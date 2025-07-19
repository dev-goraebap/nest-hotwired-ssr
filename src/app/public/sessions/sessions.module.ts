import { Module } from '@nestjs/common';
import { PublicSessionsController } from './sessions.controller';

@Module({
  imports: [],
  controllers: [PublicSessionsController],
})
export class PublicSessionsModule {}
