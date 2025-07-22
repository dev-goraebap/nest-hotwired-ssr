import { DynamicModule, Module, Provider, Type } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AttachmentEntity } from './entities/attachment.entity';
import { BlobEntity } from './entities/blob.entity';
import { LocalStorageAdapter } from './infra/adapters/local-storage.adapter';
import { GcsStorageAdapter } from './infra/adapters/gcs-storage.adapter';
import { STORAGE_PORT } from './infra/ports/storage.port';
import { ActiveStorageService } from './services/active-storage.service';
import {
  TYPEORM_ACTIVE_STORAGE_OPTIONS,
  TypeormActiveStorageOptions,
  TypeormActiveStorageOptionsFactory,
} from './options.factory';

@Module({})
export class TypeormActiveStorageModule {
  static forRoot(options: TypeormActiveStorageOptions): DynamicModule {
    const storageAdapterProvider: Provider = {
      provide: STORAGE_PORT,
      useFactory: () => {
        switch (options.serviceType) {
          case 'gcs':
            return new GcsStorageAdapter(options);
          case 'local':
          default:
            return new LocalStorageAdapter(options);
        }
      },
    };

    return {
      imports: [TypeOrmModule.forFeature([BlobEntity, AttachmentEntity])],
      providers: [
        {
          provide: TYPEORM_ACTIVE_STORAGE_OPTIONS,
          useValue: options,
        },
        storageAdapterProvider,
        ActiveStorageService,
      ],
      exports: [STORAGE_PORT, ActiveStorageService],
      module: TypeormActiveStorageModule,
      global: true,
    };
  }

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

    const storageAdapterProvider: Provider = {
      provide: STORAGE_PORT,
      useFactory: (config: TypeormActiveStorageOptions) => {
        switch (config.serviceType) {
          case 'gcs':
            return new GcsStorageAdapter(config);
          case 'local':
          default:
            return new LocalStorageAdapter(config);
        }
      },
      inject: [TYPEORM_ACTIVE_STORAGE_OPTIONS],
    };

    return {
      imports: [TypeOrmModule.forFeature([BlobEntity, AttachmentEntity])],
      providers: [
        options.useClass,
        optionsProvider,
        storageAdapterProvider,
        ActiveStorageService,
      ],
      exports: [STORAGE_PORT, ActiveStorageService],
      module: TypeormActiveStorageModule,
      global: true,
    };
  }
}
