import { join } from 'path';
import { cwd } from 'process';

import {
  GoogleVisionOptions,
  GoogleVisionOptionsFactory,
} from 'src/shared/google-vision';

export class GoogleVisionConfig implements GoogleVisionOptionsFactory {
  create(): Promise<GoogleVisionOptions> | GoogleVisionOptions {
    return {
      keyFilename: join(cwd(), 'google-vision.json'),
    };
  }
}
