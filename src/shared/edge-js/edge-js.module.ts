import {
  DynamicModule,
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';

import { EdgeJsMiddleware } from './edge-js.middleware';
import { EdgeJsRegistry } from './edge-js.registry';
import { EdgeJsView } from './edge-js.view';

@Module({}) // <- 데코레이터 생략해도 되지만 모듈이라는 걸 강조할려고 내비둠
export class EdgeJsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(EdgeJsMiddleware).forRoutes('*');
  }

  static async forRootAsync(): Promise<DynamicModule> {
    await EdgeJsRegistry.init();

    return {
      module: EdgeJsModule,
      providers: [EdgeJsView],
      global: true,
    };
  }
}
