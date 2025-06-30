import { Logger } from '@nestjs/common';
import { join } from 'path';

import {
  EdgeTemplateOptions,
  EdgeTemplateOptionsFactory,
} from 'src/shared/edge-js';

export class EdgeTemplateConfig implements EdgeTemplateOptionsFactory {
  private readonly logger = new Logger(EdgeTemplateConfig.name);

  constructor() {
    this.logger.debug('=== Init edge template config ===');
  }

  create(): Promise<EdgeTemplateOptions> | EdgeTemplateOptions {
    return {
      baseViewPath: join(process.cwd(), 'resources', 'views'),
      disks: ['pages', 'layouts', 'uikit'],
    };
  }
}
