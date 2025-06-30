import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { EdgeView } from './edge.view';

/**
 * Edge 미들웨어
 * 
 * 이 미들웨어는 모든 요청에 EdgeJsView 인스턴스를 연결합니다.
 * 요청 객체(req)에 'view' 속성으로 EdgeJsView 인스턴스를 추가하여
 * 컨트롤러가 @View() 데코레이터를 통해 EdgeJsView 인스턴스에 접근할 수 있게 합니다.
 * 
 * 미들웨어 자체는 애플리케이션 시작 시 한 번 생성되는 싱글톤이지만,
 * 주입받는 EdgeJsView는 요청별로 새 인스턴스가 생성되는 REQUEST 스코프입니다.
 * 
 * --- GPT왈(팩트채크가 안된 내용이빈다) ---
 * NestJS는 내부적으로 REQUEST 스코프 인스턴스에 대한 접근을 관리하여
 * 각 요청마다 올바른 EdgeJsView 인스턴스를 사용하도록 합니다.
 * 
 * 미들웨어는 한번만 등록되는데, 참조하는 인스턴스가 요청마다 새로 생성되어야해서 그런가
 * 해당 미들웨어 생성자도 요청마다 호출되길래 찾아본 내용.. 좀 더 정리가 필요
 */
@Injectable()
export class EdgeMiddleware implements NestMiddleware {
  private readonly logger = new Logger(EdgeMiddleware.name);

  constructor(private readonly edgeView: EdgeView) {
    this.logger.debug('init EdgeJsMiddleware');
  }

  use(req: Request, res: Response, next: (error?: any) => void) {
    req['view'] = this.edgeView;
    next();
  }
}
