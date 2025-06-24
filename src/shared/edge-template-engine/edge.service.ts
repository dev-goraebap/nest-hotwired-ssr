import { Logger } from '@nestjs/common';
import type { Edge } from 'edge.js';
import { join } from 'path';

/**
 * @description Edge.JS 템플릿 엔진을 Nestjs서 활용할 수 있게 간단하게 래핑 한 클래스
 * @description 공식문서 https://edgejs.dev/docs/introduction 참고
 */
export class EdgeService {
  private static readonly logger = new Logger(EdgeService.name);

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
   * edgejs는 esm에서 작동하도록 설계되었기 때문에 commonjs에서 일반적인 방법으로는
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

  static getEngine() {
    if (!this.edge) {
      throw new Error(
        'Edge.js가 초기화되지 않았습니다. 먼저 main.ts 파일에 await EdgeService.init(); 를 선언해주세요.',
      );
    }
    return this.edge;
  }
}
