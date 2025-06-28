import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: join(process.cwd(), 'storage', 'development.sqlite'),
      synchronize: true,
      autoLoadEntities: true,
      logger: 'debug',
      logging: true,
    }),
  ],
})
export class DatabaseModule {}
