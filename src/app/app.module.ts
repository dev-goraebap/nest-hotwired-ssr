import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import { AppExceptionFilter } from 'src/common/filters/app-exception.filter';
import { GlobalPageStatesInterceptor } from 'src/common/interceptors/global-page-states.interceptor';

import { AdminModule } from './admin/admin.module';
import { PublicModule } from './public/public.module';

@Module({
  imports: [
    AdminModule,
    PublicModule
  ],
  providers: [
    { provide: APP_FILTER, useClass: AppExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: GlobalPageStatesInterceptor },
  ],
})
export class AppModule {}
