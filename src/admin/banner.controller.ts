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
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { extname } from 'path';

// 배너 타입 열거형
enum BannerActionType {
  LINK = 'LINK',
  DR = 'DR',
  PLUS_DR = 'PLUS_DR',
  GUIDE = 'GUIDE',
}

// 배너 인터페이스 정의
interface Banner {
  id: number;
  actionType: BannerActionType;
  actionUrl?: string;
  imageUrl: string;
  displayOrder: number;
}

// 배너 생성 DTO
class CreateBannerDto {
  actionType: BannerActionType;
  actionUrl?: string;
  displayOrder: number;
}

@Controller({ path: 'admin/banners' })
export class BannerController {
  // 목데이터
  private banners: Banner[] = [
    {
      id: 1,
      actionType: BannerActionType.LINK,
      actionUrl: 'https://example.com/promotion/summer-sale',
      imageUrl: '/imgs/banner1.webp',
      displayOrder: 1,
    },
    {
      id: 2,
      actionType: BannerActionType.DR,
      imageUrl: '/imgs/banner2.webp',
      displayOrder: 2,
    },
    {
      id: 3,
      actionType: BannerActionType.PLUS_DR,
      imageUrl: '/imgs/banner3.webp',
      displayOrder: 3,
    },
    {
      id: 4,
      actionType: BannerActionType.GUIDE,
      imageUrl: '/imgs/banner4.webp',
      displayOrder: 4,
    },
  ];

  private nextId = 5;

  @Get()
  @Render('banners/index')
  async index() {
    // 순서(displayOrder)에 따라 정렬
    const sortedBanners = [...this.banners].sort(
      (a, b) => a.displayOrder - b.displayOrder,
    );

    return {
      banners: sortedBanners,
      // 액션 타입별 표시 이름 매핑
      actionTypeLabels: {
        [BannerActionType.LINK]: '외부링크',
        [BannerActionType.DR]: '국민DR',
        [BannerActionType.PLUS_DR]: '플러스DR',
        [BannerActionType.GUIDE]: '가이드',
      },
      // 액션 타입별 배경 색상 클래스 매핑
      actionTypeColors: {
        [BannerActionType.LINK]: 'bg-blue-500',
        [BannerActionType.DR]: 'bg-indigo-500',
        [BannerActionType.PLUS_DR]: 'bg-yellow-500',
        [BannerActionType.GUIDE]: 'bg-green-500',
      },
    };
  }

  @Get('new')
  @Render('banners/new')
  async new(@Res() res: Response) {
    return {
      actionTypes: Object.values(BannerActionType),
      error: res.locals.error || null,
    };
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './resources/imgs',
        filename: (req, file, cb) => {
          // 고유한 파일명 생성
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `banner-${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        // 이미지 파일만 허용
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
          return cb(new Error('이미지 파일만 업로드할 수 있습니다.'), false);
        }
        cb(null, true);
      },
    }),
  )
  async create(
    @Body() createBannerDto: CreateBannerDto,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    try {
      // 유효성 검사
      const errors: string[] = [];

      if (!file) {
        errors.push('배너 이미지는 필수입니다.');
      }

      if (!createBannerDto.actionType) {
        errors.push('액션 타입은 필수입니다.');
      }

      // 액션 타입이 LINK인 경우 URL 필수
      if (
        createBannerDto.actionType === BannerActionType.LINK &&
        !createBannerDto.actionUrl
      ) {
        errors.push('외부링크 타입은 액션 URL이 필수입니다.');
      }

      // 오류가 있으면 폼으로 돌아가서 에러 메시지 표시
      if (errors.length > 0) {
        return res.render('banners/new', {
          actionTypes: Object.values(BannerActionType),
          error: errors.join('<br>'),
          formData: createBannerDto, // 이전에 입력한 데이터 유지
        });
      }

      // 새 배너 추가
      const newBanner: Banner = {
        id: this.nextId++,
        actionType: createBannerDto.actionType as BannerActionType,
        imageUrl: `/imgs/${file.filename}`,
        displayOrder: createBannerDto.displayOrder || this.banners.length + 1,
      };

      // 액션 타입이 LINK인 경우에만 URL 포함
      if (createBannerDto.actionType === BannerActionType.LINK) {
        newBanner.actionUrl = createBannerDto.actionUrl;
      }

      this.banners.push(newBanner);

      // 리스트 페이지로 리다이렉트
      return res.redirect('/admin/banners');
    } catch (error) {
      return res.render('banners/new', {
        actionTypes: Object.values(BannerActionType),
        error: '배너 등록 중 오류가 발생했습니다: ' + error.message,
        formData: createBannerDto, // 이전에 입력한 데이터 유지
      });
    }
  }

  @Get('edit/:id')
  @Render('banners/edit')
  async edit(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const banner = this.banners.find((b) => b.id === id);

    if (!banner) {
      return res.redirect('/admin/banners');
    }

    return {
      banner,
      actionTypes: Object.values(BannerActionType),
      error: res.locals.error || null,
    };
  }

  @Post('update/:id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './resources/imgs',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `banner-${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBannerDto: CreateBannerDto,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    const bannerIndex = this.banners.findIndex((b) => b.id === id);

    if (bannerIndex === -1) {
      return res.redirect('/admin/banners');
    }

    try {
      const errors: string[] = [];

      if (!updateBannerDto.actionType) {
        errors.push('액션 타입은 필수입니다.');
      }

      if (
        updateBannerDto.actionType === BannerActionType.LINK &&
        !updateBannerDto.actionUrl
      ) {
        errors.push('외부링크 타입은 액션 URL이 필수입니다.');
      }

      if (errors.length > 0) {
        return res.render('banners/edit', {
          banner: { ...this.banners[bannerIndex], ...updateBannerDto },
          actionTypes: Object.values(BannerActionType),
          error: errors.join('<br>'),
        });
      }

      // 기존 배너 정보 업데이트
      this.banners[bannerIndex] = {
        ...this.banners[bannerIndex],
        actionType: updateBannerDto.actionType as BannerActionType,
        displayOrder:
          updateBannerDto.displayOrder ||
          this.banners[bannerIndex].displayOrder,
        actionUrl:
          updateBannerDto.actionType === BannerActionType.LINK
            ? updateBannerDto.actionUrl
            : undefined,
      };

      // 이미지가 업로드된 경우 이미지 URL 업데이트
      if (file) {
        this.banners[bannerIndex].imageUrl = `/imgs/${file.filename}`;
      }

      return res.redirect('/admin/banners');
    } catch (error) {
      return res.render('banners/edit', {
        banner: this.banners[bannerIndex],
        actionTypes: Object.values(BannerActionType),
        error: '배너 수정 중 오류가 발생했습니다: ' + error.message,
      });
    }
  }

  @Get('destroy/:id')
  async destroy(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const bannerIndex = this.banners.findIndex((b) => b.id === id);

    if (bannerIndex !== -1) {
      this.banners.splice(bannerIndex, 1);
    }

    return res.redirect('/admin/banners');
  }
}
