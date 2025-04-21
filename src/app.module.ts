import { Module } from '@nestjs/common';
import { AdminModule } from './admin';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database';

@Module({
  imports: [
    DatabaseModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
