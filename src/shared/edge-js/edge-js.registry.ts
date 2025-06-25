import { Logger } from '@nestjs/common';
import { Edge } from 'edge.js';
import { join } from 'path';

/** 
 * Edge.js 라이브러리를 NestJS 애플리케이션에서 사용하기 위한 레지스트리입니다.
 * - ESM/CommonJS 호환성: Edge.js는 ESM 방식으로 설계된 라이브러리로, 
 *   CommonJS 환경에서 사용하기 위해 동적 import를 통해 로드합니다.
 * - 싱글톤 인스턴스 관리: 애플리케이션 전역에서 사용할 Edge.js 인스턴스를 
 *   초기화하고 안전하게 공유합니다.
 * - 경로 설정: 템플릿 파일의 기본 경로와 각 볼륨등을 설정합니다.
 */
export class EdgeJsRegistry {
  private static readonly logger = new Logger(EdgeJsRegistry.name);

  private static edge: Edge | null = null;

  // 뷰 폴더 기본경로, 나중에 외부에서 주입받을 수 있게 할까 생각중
  private static readonly BASE_VIEWS_PATH = join(
    process.cwd(),
    'resources',
    'views',
  );

  /**
   * - Edge.JS 템플릿 엔진 초기화
   * 경로설정 및 Edge 인스턴스를 만들어냅니다.
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
   * edge.js 인스턴스를 반환
   *
   * @description 먼저 클래스메서드 `init`을 통해 초기화가 필요함
   */
  static getInstance() {
    if (!this.edge) {
      throw new Error(
        'Edge.js가 초기화되지 않았습니다. edge-js 모듈이 등록되었는지 확인해 주세요.',
      );
    }
    return this.edge;
  }
}
