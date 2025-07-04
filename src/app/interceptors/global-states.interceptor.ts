import {
  CallHandler,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

import { Request } from 'express';
import { EdgeView } from 'src/shared/edge-in-nest';
import { CategoriesService } from '../services/categories.service';

@Injectable()
export class GlobalStatesInterceptor implements NestInterceptor {
  private readonly logger = new Logger(GlobalStatesInterceptor.name);

  constructor(private readonly categoriesService: CategoriesService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    const req: Request = context.switchToHttp().getRequest();
    this.logger.debug(req.url);

    // /api/* 경로는 제외
    if (req.url?.startsWith('/api/')) {
      return next.handle();
    }

    const view: EdgeView = req['view'];
    if (!(view instanceof EdgeView)) {
      throw new InternalServerErrorException(
        '상태를 저장할 view 인스턴스를 찾을 수 없습니다',
      );
    }

    // 전역 테마설정
    const theme = this.initTheme(req);
    if (theme) {
      this.logger.debug('테마 요청됨');
      view.share({ theme });
    }

    // 카테고리 매뉴 설정
    const categories = await this.categoriesService.getSidebarCategories();
    view.share({ categories });

    // 플레시 데이터 제거
    return next.handle().pipe(
      tap(() => {
        delete req.session['flash'];
      }),
    );
  }

  /**
   * 쿠키에서 테마 정보 가져오기
   * @description
   * - cookie-parser 설정이 되어있지 않으면 쿠키를 읽을 수 없습니다.
   * - 쿠키에서 theme 값을 가져올 수 없으면 lemonade가 기본값입니다.
   */
  initTheme(req: Request): string {
    const defaultTheme = 'retro';
    const cookies = req.cookies;
    if (!cookies) {
      this.logger.warn('쿠키가 활성화되지 않았습니다.');
      return defaultTheme;
    }

    const theme = cookies?.theme;
    if (!theme) {
      return defaultTheme;
    }

    return theme;
  }
}
