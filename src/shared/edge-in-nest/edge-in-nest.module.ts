import {
  DynamicModule,
  MiddlewareConsumer,
  Module,
  NestModule,
  Provider,
  Type,
} from '@nestjs/common';

import { EdgeMiddleware } from './edge.middleware';
import { EdgeRegistry } from './edge.registry';
import { EdgeView } from './edge.view';
import { EDGE_IN_NEST_OPTIONS } from './interfaces/edge-in-nest-options';
import { EdgeInNestOptionsFactory } from './interfaces/edge-in-nest-options-factory';

@Module({}) // <- 데코레이터 생략해도 되지만 모듈이라는 걸 강조할려고 내비둠
export class EdgeInNestModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(EdgeMiddleware).forRoutes('*');
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
      ],
      global: true,
    };
  }
}
