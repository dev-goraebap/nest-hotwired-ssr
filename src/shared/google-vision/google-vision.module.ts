import { DynamicModule, Module, Provider, Type } from '@nestjs/common';
import {
  GOOGLE_VISION_OPTIONS,
  GoogleVisionOptionsFactory,
} from './google-vision-options.factory';
import { GoogleVisionService } from './google-vision.service';

@Module({})
export class GoogleVisionModule {
  static forRootAsync(options: {
    useClass: Type<GoogleVisionOptionsFactory>;
  }): DynamicModule {
    const optionsProvider: Provider = {
      provide: GOOGLE_VISION_OPTIONS,
      useFactory: async (factory: GoogleVisionOptionsFactory) => {
        return await factory.create();
      },
      inject: [options.useClass],
    };

    return {
      providers: [options.useClass, optionsProvider, GoogleVisionService],
      exports: [GoogleVisionService],
      module: GoogleVisionModule,
      global: true,
    };
  }
}
