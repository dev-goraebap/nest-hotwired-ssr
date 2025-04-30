import { Injectable, NestMiddleware } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NextFunction, Request, Response } from 'express';
import { Repository } from 'typeorm';

import { IpWhitelistEntity } from 'src/admin/entities/ip-whitelist.entity';
import { createLogger } from '../../common/logging/logger.util';

@Injectable()
export class IpWhitelistMiddleware implements NestMiddleware {
  private readonly logger = createLogger('IpWhitelist');

  constructor(
    @InjectRepository(IpWhitelistEntity)
    private readonly ipWhitelistRepository: Repository<IpWhitelistEntity>,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // 클라이언트 IP 주소 가져오기 (프록시를 통한 경우 고려)
    const clientIp = this.getClientIp(req);
    this.logger.debug(`요청 IP: ${clientIp}, 경로: ${req.originalUrl}`);

    // 로컬 개발 환경인 경우 IP 체크 생략
    if ((clientIp === '127.0.0.1' || clientIp === '::1')) {
      this.logger.debug('로컬 개발 환경에서의 접근이므로 IP 검사 생략');
      return next();
    }

    try {
      // 화이트리스트에 IP가 있는지 확인
      const ipExists = await this.ipWhitelistRepository.findOne({
        where: { ip: clientIp },
      });

      if (ipExists) {
        // IP가 화이트리스트에 있으면 접속 허용
        next();
      } else {
        // IP가 화이트리스트에 없으면 접근 거부
        this.logger.warn(
          `허용되지 않은 IP로부터 접근 시도: ${clientIp}, 경로: ${req.originalUrl}`,
        );
        return res.status(403).render('errors/403', {
          message: '이 IP 주소에서는 관리자 페이지에 접근할 수 없습니다.',
          clientIp,
        });
      }
    } catch (error) {
      // 데이터베이스 오류 등의 예외 처리
      this.logger.error(`IP 화이트리스트 확인 중 오류: ${error.message}`);
      return next(); // 오류 시에는 다음 미들웨어로 진행 (선택적으로 접근 거부할 수도 있음)
    }
  }

  /**
   * 클라이언트 IP 주소를 가져오는 헬퍼 함수
   * 프록시 서버를 통한 요청도 처리
   */
  private getClientIp(req: Request): string {
    // X-Forwarded-For 헤더가 있을 경우 (프록시를 통한 요청)
    const xForwardedFor = req.headers['x-forwarded-for'];
    if (xForwardedFor) {
      const ips = Array.isArray(xForwardedFor)
        ? xForwardedFor[0]
        : xForwardedFor.split(',')[0].trim();
      return ips;
    }

    // 프록시를 통하지 않은 직접 요청
    return req.ip || req.connection.remoteAddress || '';
  }
}
