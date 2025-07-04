import { Inject, Injectable, Logger, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

import { randomBytes } from 'crypto';
import { EdgeRegistry } from './edge.registry';

/**
 * EdgeJs 뷰 서비스
 *
 * 이 서비스는 요청별로 인스턴스가 생성되는 REQUEST 스코프로 동작합니다.
 * 각 요청마다 독립적인 Edge 렌더러 인스턴스를 생성하여 데이터를 격리하며,
 * 요청 컨텍스트에 접근하여 세션 기반의 플래시 메시지와 쿠키 기반 테마 기능을 지원합니다.
 */
@Injectable({ scope: Scope.REQUEST })
export class EdgeView {
  private readonly logger = new Logger(EdgeView.name);
  private readonly requestScopedEdge: any; // 요청 스코프 렌더러 인스턴스

  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly edgeJsRegistry: EdgeRegistry,
  ) {
    // EdgeJsRegistry에서 기본 Edge 인스턴스를 가져와,
    // 이로부터 요청별로 독립적인 새 렌더러 인스턴스를 생성합니다.
    // 기본 인스턴스의 모든 설정 (마운트 경로 등) 은 상속됨
    this.logger.debug('요청별 edge renderer 생성');
    this.requestScopedEdge = this.edgeJsRegistry.getInstance().createRenderer();

    this.setCsrf();

    // 요청별 데이터를 이 독립적인 렌더러 인스턴스에 share 합니다.
    // 이 데이터는 현재 요청 내에서 이 렌더러를 통해 렌더링되는 모든 템플릿에
    // 전역적으로 (이 요청 내에서만) 사용 가능합니다.
    const flash = this.getFlash();
    if (flash) {
      this.logger.debug('플래시 메시지 요청됨');
      this.requestScopedEdge.share({ flash });
    }

    const theme = this.getTheme();
    if (theme) {
      this.logger.debug('테마 요청됨');
      this.requestScopedEdge.share({ theme });
    }
  }

  /**
   * 템플릿 렌더링 기능
   * 'state' 인자로 전달된 데이터는 이미 share된 데이터와 병합되어 템플릿에 전달됩니다.
   */
  async render(templatePath: string, state?: Record<string, any>) {
    const renderer = this.requestScopedEdge;

    try {
      return await renderer.render(templatePath, state);
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  async share(state: Record<string, any>) {
    this.requestScopedEdge.share(state);
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
  setFlash(
    type: 'notice' | 'alert',
    message: string,
    data: Record<string, any> = {},
  ) {
    if (!this.request.session) {
      this.logger.warn('세션이 활성화되지 않았습니다.');
      return;
    }

    this.request.session['flash'] = { type, message, data };
  }

  /**
   * 플래시 메시지 가져오기
   */
  getFlash() {
    if (!this.request.session) {
      return null;
    }

    const flash = this.request.session['flash'];
    return {
      type: flash?.type,
      message: flash?.message,
      data: flash?.data,
    };
  }

  /**
   * 쿠키에서 테마 정보 가져오기
   * @description
   * - cookie-parser 설정이 되어있지 않으면 쿠키를 읽을 수 없습니다.
   * - 쿠키에서 theme 값을 가져올 수 없으면 lemonade가 기본값입니다.
   */
  getTheme(): string {
    const defaultTheme = 'lemonade';
    const cookies = this.request.cookies;
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

  private setCsrf() {
    if (!this.request.session) {
      throw new Error(
        'Session middleware must be registered before EdgeMiddleware',
      );
    }

    const isTurboRequest = !!this.request.headers['x-turbo-request-id'];

    // 1. 세션에 CSRF 토큰이 없으면 생성 (터보 요청이 아닐 경우에만)
    if (!this.request.session['csrfToken'] && !isTurboRequest) {
      const csrfToken = randomBytes(32).toString('hex');
      this.logger.debug('새로운 csrfToken 토큰 발급: ' + csrfToken);
      this.request.session['csrfToken'] = csrfToken;
    }

    // 2. 뷰에 CSRF 토큰 공유
    const csrfToken = this.request.session['csrfToken'];
    if (csrfToken) {
      this.logger.debug(`CSRF 토큰 사용: ${csrfToken}`);
      this.requestScopedEdge.share({ csrfToken });
    } else if (isTurboRequest) {
      this.logger.warn(
        'CSRF 토큰이 세션에 없지만, 터보 요청이므로 새로 발급하지 않습니다.',
      );
    }
  }
}
