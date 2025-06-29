import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { join } from 'path';

@Injectable()
export class TypeOrmConfig implements TypeOrmOptionsFactory {
  private readonly logger = new Logger(TypeOrmConfig.name);

  constructor(private readonly configService: ConfigService) {
    this.logger.debug('=== Init typeorm config ===');
  }

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
