import { Logger } from '@nestjs/common';
import { join } from 'path';

import {
  EdgeInNestOptions,
  EdgeInNestOptionsFactory,
} from 'src/shared/edge-in-nest';

export class EdgeInNestConfig implements EdgeInNestOptionsFactory {
  private readonly logger = new Logger(EdgeInNestConfig.name);

  constructor() {
    this.logger.debug('=== Init EdgeInNest Module config ===');
  }

  create(): Promise<EdgeInNestOptions> | EdgeInNestOptions {
    return {
      baseViewPath: join(process.cwd(), 'resources', 'views'),
      disks: [],
      cache: process.env.NODE_ENV === 'production',
    };
  }
}
