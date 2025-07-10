import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { I18nContext } from 'nestjs-i18n';
import { NestMvcView } from 'nestjs-mvc-tools';

import { CategoriesService } from '../services/admin/categories.service';

@Injectable()
export class GlobalPageStatesInterceptor implements NestInterceptor {
  constructor(private readonly categoriesService: CategoriesService) {}

  async intercept(context: ExecutionContext, next: CallHandler<any>) {
    // View 인스턴스 가져오기
    const req: Request = context.switchToHttp().getRequest();
    const view = req['view'] as NestMvcView;

    if (!view) {
      throw new Error('Edge View 인스턴스가 초기화되지않음');
    }

    // 현재 요청의 언어 가져오기
    const i18nContext = I18nContext.current();
    const lang = i18nContext?.lang;

    const categories = await this.categoriesService.getSidebarCategories();

    // 전역 상태로 lang 처리
    view.share({ lang, categories });

    return next.handle();
  }
}
