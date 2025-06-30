import { Inject, Injectable, Logger } from '@nestjs/common';
import { Edge } from 'edge.js';
import { join } from 'path';
import {
  EDGE_IN_NEST_OPTIONS,
  EdgeInNestOptions,
} from './interfaces/edge-in-nest-options';

/**
 * Edge.js 라이브러리를 NestJS 애플리케이션에서 사용하기 위한 레지스트리입니다.
 * - ESM/CommonJS 호환성: Edge.js는 ESM 방식으로 설계된 라이브러리로,
 *   CommonJS 환경에서 사용하기 위해 동적 import를 통해 로드합니다.
 * - 싱글톤 인스턴스 관리: 애플리케이션 전역에서 사용할 Edge.js 인스턴스를
 *   초기화하고 안전하게 공유합니다.
 * - 경로 설정: 템플릿 파일의 기본 경로와 각 볼륨등을 설정합니다.
 */
@Injectable()
export class EdgeRegistry {
  private readonly logger = new Logger(EdgeRegistry.name);

  private edge: Edge | null = null;

  constructor(
    @Inject(EDGE_IN_NEST_OPTIONS)
    private readonly options: EdgeInNestOptions,
  ) {
    this.init();
  }

  /**
   * - Edge.JS 템플릿 엔진 초기화
   * 경로설정 및 Edge 인스턴스를 만들어냅니다.
   */
  async init() {
    if (this.edge) {
      this.logger.debug('Edge instance already exists, doing nothing.');
      return;
    }

    try {
      const { Edge: EdgeConstructor } = await import('edge.js');

      // edge.js 인스턴스 생성
      this.edge = EdgeConstructor.create({
        cache: this.options.cache
      });

      // 디스크 마운트
      for (let disk of this.options.disks) {
        this.edge.mount(disk, join(this.options.baseViewPath, disk));
      }

      this.logger.debug(`Edge.js 경로 초기화: ${this.options.baseViewPath}`);
    } catch (err) {
      this.logger.error('Edge.js 초기화에 실패하였습니다:', err);
      throw new Error(err.message || err);
    }
  }

  /**
   * edge.js 인스턴스를 반환
   *
   * @description 먼저 `init`을 통해 초기화가 필요함
   */
  getInstance() {
    if (!this.edge) {
      throw new Error(
        'Edge.js가 초기화되지 않았습니다. edge-js 모듈이 등록되었는지 확인해 주세요.',
      );
    }
    return this.edge;
  }
}
