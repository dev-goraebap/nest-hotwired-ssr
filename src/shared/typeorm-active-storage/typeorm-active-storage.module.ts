import { DynamicModule, Module } from '@nestjs/common';

import { LocalStorageAdapter } from './infra/adapters/local-storage.adapter';
import { STORAGE_PORT } from './infra/ports/storage.port';
import { ActiveStorageService } from './services/active-storage.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlobEntity } from './entities/blob.entity';
import { AttachmentEntity } from './entities/attachment.entity';

@Module({})
export class TypeormActiveStorageModule {
  static forRoot(): DynamicModule {
    return {
      imports: [TypeOrmModule.forFeature([BlobEntity, AttachmentEntity])],
      providers: [
        { provide: STORAGE_PORT, useClass: LocalStorageAdapter },
        ActiveStorageService,
      ],
      exports: [STORAGE_PORT, ActiveStorageService],
      module: TypeormActiveStorageModule,
      global: true,
    };
  }
}
