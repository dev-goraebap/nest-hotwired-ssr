import { Inject, Injectable, Logger, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { EdgeJsRegistry } from './edge-js.registry';

/**
 * EdgeJs 뷰 서비스
 *
 * 이 서비스는 요청별로 인스턴스가 생성되는 REQUEST 스코프로 동작합니다.
 * Edge.js 템플릿 엔진을 사용하여 템플릿 렌더링 기능을 제공하며,
 * 현재 요청 컨텍스트에 접근하여 세션 기반의 플래시 메시지 기능도 지원합니다.
 *
 * 주요 기능:
 * - 템플릿 렌더링: Edge.js를 통해 템플릿을 HTML로 렌더링
 * - Turbo 요청 처리: Turbo 프레임워크와 호환되는 특수 렌더링 지원
 * - 플래시 메시지: 세션을 활용한 일회성 메시지 기능 제공
 *
 * NestJS의 @View() 데코레이터와 함께 사용되어 컨트롤러에서 쉽게 접근 가능합니다.
 */
@Injectable({ scope: Scope.REQUEST })
export class EdgeJsView {
  private readonly logger = new Logger(EdgeJsView.name);

  constructor(@Inject(REQUEST) private readonly request: Request) {
    this.logger.debug('init EdgeJsView');
  }

  /**
   * 템플릿 렌더링 기능
   */
  async render(templatePath: string, state?: Record<string, any>) {
    const mergedState = { ...state };
    const flash = this.getFlash();

    if (flash) {
      Object.assign(mergedState, { flash });
    }

    try {
      const edge = EdgeJsRegistry.getInstance();
      return await edge.render(templatePath, mergedState);
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  /**
   * Turbo 요청만 허용하는 렌더링
   */
  async renderOnlyTurboRequest(
    templatePath: string,
    state?: Record<string, any>,
  ) {
    if (!this.request.headers['x-turbo-request-id']) {
      throw new Error('NOT_TURBO_REQUEST');
    }

    return this.render(templatePath, state);
  }

  /**
   * 플래시 메시지 설정
   */
  setFlash(type: 'notice' | 'alert', message: string) {
    if (!this.request.session) {
      this.logger.warn('세션이 활성화되지 않았습니다.');
      return;
    }

    this.request.session['flash'] = { type, message };
  }

  /**
   * 플래시 메시지 가져오기
   */
  getFlash() {
    if (!this.request.session) {
      return null;
    }

    const flash = this.request.session['flash'];
    delete this.request.session['flash'];
    return flash;
  }
}
