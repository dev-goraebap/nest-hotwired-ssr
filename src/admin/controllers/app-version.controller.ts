import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Render,
  Req,
  Res
} from '@nestjs/common';
import { Request, Response } from 'express';

import { PlatformTypes } from '../entities/app-version.entity';
import { AppVersionService } from '../services/app-version.service';

@Controller({ path: '/admin/versions' })
export class AppVersionController {
  constructor(private readonly appVersionService: AppVersionService) {}

  @Get()
  @Render('app-versions/index')
  async index(@Query() query: { platform?: string; sort?: string }) {
    const platform =
      query.platform !== 'all' ? (query.platform as PlatformTypes) : undefined;
    const sort = query.sort || 'latest'; // 'latest' 또는 'oldest'

    const result = await this.appVersionService.getAll(platform, sort);

    return {
      versions: result.data || [],
      message: result.firstMessage,
      filters: {
        platform: platform || 'all',
        sort: sort,
      },
    };
  }

  @Get('new')
  @Render('app-versions/new')
  async new() {
    return {
      platformTypes: this.appVersionService.getPlatformTypes(),
      formData: {},
    };
  }

  @Post()
  async create(@Body() createDto: any, @Res() res: Response) {
    const result = await this.appVersionService.create({
      type: createDto.type as PlatformTypes,
      version: createDto.version,
      validYn: 'N', // 기본값은 'N' (false)
    });

    if (result.failure) {
      return res.render('app-versions/new', {
        platformTypes: this.appVersionService.getPlatformTypes(),
        formData: createDto,
        error: result.firstMessage,
      });
    }

    return res.redirect('/admin/versions');
  }

  @Post('update/:type/:version/valid-yn')
  async updateValidYn(
    @Param('type') type: PlatformTypes,
    @Param('version') version: string,
    @Body() updateDto: { validYn: string },
    @Req() req: Request,
    @Res() res: Response,
  ) {
    // 업데이트 로직 실행
    await this.appVersionService.updateValidYn(
      type,
      version,
      updateDto.validYn,
    );

    console.log(req.headers.referer);

    // Referer 헤더에서 원래 페이지 URL 가져오기
    const referer = req.headers.referer || '/admin/versions';

    // 원래 페이지로 리다이렉트 (쿼리스트링 포함)
    return res.redirect(referer);
  }

  // 삭제 핸들러
  @Post('delete/:type/:version')
  async deleteVersion(
    @Param('type') type: PlatformTypes,
    @Param('version') version: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    // 삭제 로직 실행
    await this.appVersionService.delete(type, version);

    // Referer 헤더에서 원래 페이지 URL 가져오기
    const referer = req.headers.referer || '/admin/versions';

    // 원래 페이지로 리다이렉트 (쿼리스트링 포함)
    return res.redirect(referer);
  }
}
