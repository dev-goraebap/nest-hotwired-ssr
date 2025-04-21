import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Render,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { BannerActionType, BannerService } from '../services/banner.service';

@Controller({ path: 'admin/banners' })
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  private static getFileOptions() {
    return {
      storage: diskStorage({
        destination: './resources/public/imgs',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `banner-${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
          return cb(new Error('이미지 파일만 업로드할 수 있습니다.'), false);
        }
        cb(null, true);
      },
    };
  }

  @Get()
  @Render('banners/index')
  async index() {
    const result = await this.bannerService.getAll();

    return {
      banners: result.data || [],
      actionTypeLabels: this.bannerService.getActionTypeLabels(),
      actionTypeColors: this.bannerService.getActionTypeColors(),
      message: result.firstMessage,
    };
  }

  @Get('new')
  @Render('banners/new')
  async new(@Res() res: Response) {
    return {
      formData: {},
      actionTypes: Object.values(BannerActionType),
      isEdit: false,
      error: res.locals.error || null,
    };
  }

  @Post()
  @UseInterceptors(FileInterceptor('image', BannerController.getFileOptions()))
  async create(
    @Body() createBannerDto: any,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    // 유효성 검사
    const validateResult = await this.bannerService.validateCreate(
      createBannerDto,
      file,
    );

    if (validateResult.failure) {
      return res.render('banners/new', {
        formData: createBannerDto,
        actionTypes: Object.values(BannerActionType),
        isEdit: false,
        error: validateResult.fullMessages.join('<br>'),
      });
    }

    // 배너 생성
    const createResult = await this.bannerService.create(validateResult.data!);

    if (createResult.failure) {
      return res.render('banners/new', {
        formData: createBannerDto,
        actionTypes: Object.values(BannerActionType),
        isEdit: false,
        error: createResult.firstMessage,
      });
    }

    // 성공 시 리디렉션
    return res.redirect('/admin/banners');
  }

  @Get('edit/:id')
  @Render('banners/edit')
  async edit(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const bannerResult = await this.bannerService.getOne(id);

    if (bannerResult.failure) {
      return res.redirect('/admin/banners');
    }

    return {
      formData: bannerResult.data,
      actionTypes: Object.values(BannerActionType),
      isEdit: true,
      bannerId: id,
      error: res.locals.error || null,
    };
  }

  @Post('update/:id')
  @UseInterceptors(FileInterceptor('image', BannerController.getFileOptions()))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBannerDto: any,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    // 현재 배너 가져오기
    const currentBannerResult = await this.bannerService.getOne(id);

    if (currentBannerResult.failure) {
      return res.redirect('/admin/banners');
    }

    // 유효성 검사
    const validateResult = await this.bannerService.validateUpdate(
      updateBannerDto,
      file,
      currentBannerResult.data!,
      id,
    );

    if (validateResult.failure) {
      return res.render('banners/edit', {
        formData: { ...currentBannerResult.data, ...updateBannerDto },
        actionTypes: Object.values(BannerActionType),
        isEdit: true,
        bannerId: id,
        error: validateResult.fullMessages.join('<br>'),
      });
    }

    // 배너 업데이트
    const updateResult = await this.bannerService.update(
      id,
      validateResult.data!,
    );

    if (updateResult.failure) {
      return res.render('banners/edit', {
        formData: { ...currentBannerResult.data, ...updateBannerDto },
        actionTypes: Object.values(BannerActionType),
        isEdit: true,
        bannerId: id,
        error: updateResult.firstMessage,
      });
    }

    // 성공 시 리디렉션
    return res.redirect('/admin/banners');
  }

  @Post('update-order')
  async updateOrder(
    @Body() data: { orders: { id: number; order: number }[] },
    @Res() res: Response,
  ) {
    const result = await this.bannerService.updateOrder(data.orders);

    if (result.failure) {
      return res.status(500).json({
        success: false,
        message: result.firstMessage,
      });
    }

    return res.json({
      success: true,
      message: result.firstMessage,
    });
  }

  @Get('destroy/:id')
  async destroy(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    await this.bannerService.delete(id);
    return res.redirect('/admin/banners');
  }
}
