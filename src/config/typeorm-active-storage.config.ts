import { join } from 'path';

import {
  TypeormActiveStorageOptions,
  TypeormActiveStorageOptionsFactory,
} from 'src/shared/typeorm-active-storage/options.factory';

export class TypeormActiveStorageConfig
  implements TypeormActiveStorageOptionsFactory
{
  create(): Promise<TypeormActiveStorageOptions> | TypeormActiveStorageOptions {
    return {
      storageRootPath: join(process.cwd(), 'storage', 'uploads'),
      serviceType: 'local',
    };
  }
}
