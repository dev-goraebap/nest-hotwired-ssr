export interface GcsStorageOptions {
  projectId?: string;
  keyFilename?: string;
  bucketName: string;
}

export type TypeormActiveStorageOptions = {
  storageRootPath: string;
  serviceType: 'local' | 'gcs';
  gcs?: GcsStorageOptions;
};
export const TYPEORM_ACTIVE_STORAGE_OPTIONS = 'TYPEORM_ACTIVE_STORAGE_OPTIONS';

export interface TypeormActiveStorageOptionsFactory {
  create(): Promise<TypeormActiveStorageOptions> | TypeormActiveStorageOptions;
}
