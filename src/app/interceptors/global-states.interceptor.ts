import {
  CallHandler,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

import { EdgeView } from 'src/shared/edge-in-nest';
import { CategoriesService } from '../services/categories.service';
import { Request } from 'express';

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

    if (!(req['view'] instanceof EdgeView)) {
      throw new InternalServerErrorException(
        '상태를 저장할 view 인스턴스를 찾을 수 없습니다',
      );
    }

    const categories = await this.categoriesService.getSidebarCategories();
    req['view'].share({ categories });

    return next.handle().pipe(
      tap(() => {
        delete req.session['flash'];
      })
    );
  }
}
