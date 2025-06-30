export type TypeormActiveStorageOptions = {
  storageRootPath: string;
  serviceType: 'local' | 'gcs';
};
export const TYPEORM_ACTIVE_STORAGE_OPTIONS = 'TYPEORM_ACTIVE_STORAGE_OPTIONS';

export interface TypeormActiveStorageOptionsFactory {
  create(): Promise<TypeormActiveStorageOptions> | TypeormActiveStorageOptions;
}
