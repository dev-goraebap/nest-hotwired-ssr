import { DynamicModule, Module } from '@nestjs/common';

import { LocalStorageAdapter } from './adapters/local-storage.adapter';
import { ACTIVE_STORAGE_REPOSITORY } from './interfaces/active-storage.repository';
import { STORAGE_ADAPTER } from './interfaces/storage.adapter';
import { LocalActiveStorageRepository } from './repositories/local-active-storage.repository';
import { ActiveStorageService } from './services/active-storage.service';

@Module({})
export class ActiveStorageModule {
  static forRoot(): DynamicModule {
    return {
      imports: [],
      providers: [
        { provide: ACTIVE_STORAGE_REPOSITORY, useClass: LocalActiveStorageRepository },
        { provide: STORAGE_ADAPTER, useClass: LocalStorageAdapter },
        ActiveStorageService
      ],
      exports: [
        ACTIVE_STORAGE_REPOSITORY,
        STORAGE_ADAPTER,
        ActiveStorageService
      ],
      global: true,
      module: ActiveStorageModule,
    };
  }
}
