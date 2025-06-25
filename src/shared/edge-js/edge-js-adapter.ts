import { HttpStatus, Logger } from '@nestjs/common';
import type { Edge } from 'edge.js';
import { Request, Response } from 'express';
import { join } from 'path';

/**
 * @description Edge.JS 템플릿 엔진을 Nestjs서 활용할 수 있게 간단하게 래핑 한 클래스
 * @description 공식문서 https://edgejs.dev/docs/introduction 참고
 */
export class EdgeJsAdapter {
  private static readonly logger = new Logger(EdgeJsAdapter.name);

  private static edge: Edge | null = null;

  private static readonly BASE_VIEWS_PATH = join(
    process.cwd(),
    'resources',
    'views',
  ); // 뷰 폴더 기본경로

  /**
   * Edge.JS 템플릿 엔진 초기화
   * 경로설정 및 인스턴스를 만들어냅니다.
   * @description
   * Edge.js는 esm에서 작동하도록 설계되었기 때문에 commonjs에서 일반적인 방법으로는
   * 사용할 수 없습니다. 동적 import를 통해 호출하여 인스턴스를 호출하는 방식을 활용하였습니다.
   */
  static async init() {
    if (this.edge) {
      this.logger.debug('Edge instance already exists, doing nothing.');
      return;
    }

    try {
      const { Edge: EdgeConstructor } = await import('edge.js');

      this.edge = EdgeConstructor.create({
        cache: process.env.NODE_ENV === 'production',
      });

      this.edge.mount('layout', join(this.BASE_VIEWS_PATH, 'layouts'));
      this.edge.mount('page', join(this.BASE_VIEWS_PATH, 'pages'));
      this.edge.mount('uikit', join(this.BASE_VIEWS_PATH, 'uikit'));

      this.logger.debug(`Edge.js 경로 초기화: ${this.BASE_VIEWS_PATH}`);
    } catch (err) {
      this.logger.error('Edge.js 초기화에 실패하였습니다:', err);
      throw new Error(err.message || err);
    }
  }

  /**
   * 일반적인 페이지를 랜더링할 때 사용
   * - templatePath에 일단 볼륨 명시 해줘야함
   *    - ex) page::home/index
   * - 데이터가 있는경우 state에 {} 형태로 값 할당
   * - session 의 값을 사용하기 위해 req 객체를 받게끔 변경했는데,
   * 개발 경험이 별로 안좋음. 이쯤에서 리팩토링 한번 해줘야함
   */
  static async render(
    req: Request,
    res: Response,
    templatePath: string,
    state?: Record<string, any>,
  ) {
    let mergedState = { ...state };
    const flash = this.getFlash(req);
    if (flash) {
      mergedState = { ...mergedState, flash };
    }
    const edge = this.getEdgeInstance();
    try {
      const template = await edge.render(templatePath, mergedState);
      return res.send(template);
    } catch (err) {
      this.logger.error(err);
      return this.renderErrorPage(res, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * turbo request(비동기)를 통해 요청이 온게 아니라면 404 페이지로 튕겨냄
   * - 받는 인자값은 render와 동일
   */
  static async renderOnlyTurboRequest(
    req: Request,
    res: Response,
    templatePath: string,
    state?: Record<string, any>,
  ) {
    if (!req.headers['x-turbo-request-id']) {
      return this.renderErrorPage(res, HttpStatus.NOT_FOUND);
    }

    return await this.render(req, res, templatePath, state);
  }

  /**
   * status 코드에 따라 해당하는 에러페이지로 이동
   * - 코드 정리필요
   */
  static async renderErrorPage(res: Response, status: HttpStatus) {
    let message = '';
    if (status === HttpStatus.NOT_FOUND) {
      message = '페이지를 찾을 수 없어요.';
    } else if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      message = '무언가 잘못됐어요.';
    }

    const edge = this.getEdgeInstance();
    const template = await edge.render('page::errors/index', {
      status,
      message,
    });
    return res.send(template);
  }

  static setFlash(req: Request, type: 'notice' | 'alert', message: string) {
    this.logger.log(req.session);
    if (!req.session) {
      let message =
        '세션이 활성화 되지 않았습니다. 플래시 메시지를 설정할 수 없습니다.';
      this.logger.warn(message);
      throw new Error(message);
    }

    req.session['flash'] = {
      type,
      message,
    };
  }

  static getFlash(req: Request) {
    if (!req.session) {
      return null;
    }

    const flash = req.session['flash'];
    // 읽은 후 삭제
    delete req.session['flash'];

    this.logger.log(flash);

    return flash;
  }

  static getEdgeInstance() {
    if (!this.edge) {
      throw new Error(
        'Edge.js가 초기화되지 않았습니다. 먼저 main.ts 파일에 await EdgeService.init(); 를 선언해주세요.',
      );
    }
    return this.edge;
  }
}
