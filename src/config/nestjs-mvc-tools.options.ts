import {
  NestMvcCoreOptions,
  NestMvcCoreOptionsFactory,
} from 'nestjs-mvc-tools';
import { join } from 'path';

export class NestjsMvcToolsOptionsImpl implements NestMvcCoreOptionsFactory {
  create(): Promise<Partial<NestMvcCoreOptions>> | Partial<NestMvcCoreOptions> {
    return {
      debug: process.env.NODE_ENV === 'development',
      vite: {
        buildOutDir: join(process.cwd(), 'resources', 'public', 'builds'),
        developServerUrl: 'http://localhost:5173',
        mode:
          process.env.NODE_ENV === 'development' ? 'development' : 'production',
      },
    };
  }
}
