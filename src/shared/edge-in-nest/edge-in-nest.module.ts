import {
  DynamicModule,
  MiddlewareConsumer,
  Module,
  NestModule,
  Provider,
  Type,
} from '@nestjs/common';

import { APP_FILTER } from '@nestjs/core';
import { SsrExceptionFilter } from './filters/ssr-execption.filter';
import { EDGE_IN_NEST_OPTIONS } from './interfaces/edge-in-nest-options';
import { EdgeInNestOptionsFactory } from './interfaces/edge-in-nest-options-factory';
import { EdgeMiddleware } from './middlewares/edge.middleware';
import { EdgeRegistry } from './services/edge.registry';
import { EdgeView } from './services/edge.view';

@Module({})
export class EdgeInNestModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(EdgeMiddleware).exclude('/api/*').forRoutes('*');
  }

  static forRootAsync(options: {
    useClass: Type<EdgeInNestOptionsFactory>;
  }): DynamicModule {
    // 외부 주입된 옵션팩토리를 통해 EdgeTemplateOptions를 프로바이더로 만들어냄
    const optionsProvider: Provider = {
      provide: EDGE_IN_NEST_OPTIONS,
      useFactory: async (factory: EdgeInNestOptionsFactory) => {
        return await factory.create();
      },
      inject: [options.useClass],
    };

    return {
      module: EdgeInNestModule,
      providers: [
        options.useClass,
        optionsProvider,
        EdgeRegistry,
        EdgeView,
        {
          provide: APP_FILTER,
          useClass: SsrExceptionFilter,
        },
      ],
      global: true,
    };
  }
}
