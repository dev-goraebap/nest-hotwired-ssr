import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { join } from 'path';

@Injectable()
export class TypeOrmConfig implements TypeOrmOptionsFactory {

  createTypeOrmOptions(): Promise<TypeOrmModuleOptions> | TypeOrmModuleOptions {
    return {
      type: 'sqlite',
      database: join(process.cwd(), 'storage', 'development.sqlite'),
      synchronize: true,
      autoLoadEntities: true,
      logger: 'debug',
      logging: true,
    };
  }
}
