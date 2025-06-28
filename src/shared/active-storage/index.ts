// 타입
export { AttachmentData } from './interfaces/attachment.types';
export { BlobData } from './interfaces/blob.types';

// 인터페이스 (행동 정의)
export { IAttachmentRepository } from './interfaces/repository.interface';
export { IStorageAdapter } from './interfaces/storage-adapter.interface';

// 모델
export { AttachmentModel } from './models/attachment.model';
export { BlobModel } from './models/blob.model';

// 서비스
export { AttachmentService } from './services/attachment.service';

// Repository 구현체
export { MemoryAttachmentRepository } from './repositories/memory-attachment.repository';

// StorageAdapter 구현체
export { LocalStorageAdapter } from './adapters/local-storage.adapter';

// 모듈
export { ActiveStorageModule } from './active-storage.module';

