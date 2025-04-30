import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppVersionController } from './controllers/app-version.controller';
import { BannerController } from './controllers/banner.controller';
import { DynamicContentController } from './controllers/dynamic-content.controller';
import { IpWhitelistController } from './controllers/ip-whitelist.controller';
import { LogViewerController } from './controllers/log-viewer.controller';
import { AppVersionEntity } from './entities/app-version.entity';
import { BannerEntity } from './entities/banner.entity';
import { DynamicContentEntity } from './entities/dynamic-content.entity';
import { IpWhitelistEntity } from './entities/ip-whitelist.entity';
import { IpWhitelistMiddleware } from './middleware/ip-whitelist.middleware';
import { AppVersionService } from './services/app-version.service';
import { BannerService } from './services/banner.service';
import { DynamicContentService } from './services/dynamic-content.service';
import { IpWhitelistService } from './services/ip-whitelist.service';
import { LogViewerService } from './services/log-viewer.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BannerEntity,
      AppVersionEntity,
      IpWhitelistEntity,
      DynamicContentEntity
    ]),
  ],
  controllers: [
    BannerController,
    DynamicContentController,
    AppVersionController,
    LogViewerController,
    IpWhitelistController,
  ],
  providers: [
    BannerService,
    AppVersionService,
    LogViewerService,
    IpWhitelistService,
    IpWhitelistMiddleware,
    DynamicContentService
  ],
})
export class AdminModule {
  configure(consumer: MiddlewareConsumer) {
    // IP 화이트리스트 미들웨어를 /admin 경로에 적용
    consumer
      .apply(IpWhitelistMiddleware)
      .forRoutes({ path: 'admin/*', method: RequestMethod.ALL });
  }

  // 관리자용 스웨거 설정을 위한 정적 메서드
  static setupSwagger(app) {
    const options = new DocumentBuilder()
      .setTitle('관리자 API 문서')
      .setDescription('관리자용 API 문서')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, options, {
      include: [AdminModule], // 관리자 모듈만 문서화
    });

    // 'admin/api-docs' 경로로 스웨거 설정
    // 이 경로는 'admin/*' 패턴과 일치하므로 IP 화이트리스트 미들웨어가 적용됨
    SwaggerModule.setup('admin/api-docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
      customSiteTitle: '관리자 API 문서',
    });
  }
}
