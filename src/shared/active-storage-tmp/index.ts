// 인터페이스 (행동 정의)
export { IStorageAdapter } from './interfaces/storage-adapter.interface';

// 서비스 (Active Record 기반)
export { ActiveStorageService } from './services/active-storage.service';

// StorageAdapter 구현체
export { LocalStorageAdapter } from './adapters/local-storage.adapter';

// 모델
export { AttachmentEntity } from './models/attachment.entity';
export { BlobEntity } from './models/blob.entity';

// 모듈
export { ActiveStorageModule } from './active-storage.module';

