import { join } from 'path';
import { TypeormActiveStorageOptions, TypeormActiveStorageOptionsFactory } from 'src/libs/typeorm-active-storage';

export class TypeormActiveStorageOptionsImpl
  implements TypeormActiveStorageOptionsFactory
{
  create(): Promise<TypeormActiveStorageOptions> | TypeormActiveStorageOptions {
    return {
      storageRootPath: join(process.cwd(), 'storage', 'uploads'),
      serviceType: 'local',
    };
  }
}
