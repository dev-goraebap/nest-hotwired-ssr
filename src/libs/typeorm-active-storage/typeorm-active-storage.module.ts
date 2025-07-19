import { DynamicModule, Module, Provider, Type } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AttachmentEntity } from './entities/attachment.entity';
import { BlobEntity } from './entities/blob.entity';
import { LocalStorageAdapter } from './infra/adapters/local-storage.adapter';
import { STORAGE_PORT } from './infra/ports/storage.port';
import { ActiveStorageService } from './services/active-storage.service';
import {
  TYPEORM_ACTIVE_STORAGE_OPTIONS,
  TypeormActiveStorageOptionsFactory,
} from './options.factory';

@Module({})
export class TypeormActiveStorageModule {
  static forRootAsync(options: {
    useClass: Type<TypeormActiveStorageOptionsFactory>;
  }): DynamicModule {
    const optionsProvider: Provider = {
      provide: TYPEORM_ACTIVE_STORAGE_OPTIONS,
      useFactory: async (factory: TypeormActiveStorageOptionsFactory) => {
        return await factory.create();
      },
      inject: [options.useClass],
    };

    return {
      imports: [TypeOrmModule.forFeature([BlobEntity, AttachmentEntity])],
      providers: [
        options.useClass,
        optionsProvider,
        {
          provide: STORAGE_PORT,
          useClass: LocalStorageAdapter,
        },
        ActiveStorageService,
      ],
      exports: [STORAGE_PORT, ActiveStorageService],
      module: TypeormActiveStorageModule,
      global: true,
    };
  }
}
