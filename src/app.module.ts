import { Module } from '@nestjs/common';
import { AdminModule } from './admin';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
