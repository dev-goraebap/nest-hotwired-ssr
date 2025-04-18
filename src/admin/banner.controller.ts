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
import { extname, join } from 'path';
import { promises as fs } from 'fs';

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
  private readonly bannerJsonPath = join(
    __dirname,
    '../../resources/banner.json',
  );
  private banners: Banner[] = [];

  constructor() {
    // 컨트롤러 생성 시 JSON 파일 로드
    this.loadBannersFromJson();
  }

  @Get()
  @Render('banners/index')
  async index() {
    // JSON 파일에서 최신 데이터 로드
    await this.loadBannersFromJson();

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
      formData: {}, // 빈 formData 객체
      actionTypes: Object.values(BannerActionType),
      isEdit: false,
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
      // 현재 배너 데이터 로드
      await this.loadBannersFromJson();

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

      // 중복 등록 검사 - LINK가 아닌 타입은 하나만 등록 가능
      if (createBannerDto.actionType !== BannerActionType.LINK) {
        const existingBanner = this.banners.find(
          (banner) => banner.actionType === createBannerDto.actionType,
        );

        if (existingBanner) {
          errors.push(
            `${this.getActionTypeLabel(createBannerDto.actionType)} 타입의 배너는 이미 등록되어 있습니다. 각 타입당 하나의 배너만 등록 가능합니다.`,
          );
        }
      }

      // 오류가 있으면 폼으로 돌아가서 에러 메시지 표시
      if (errors.length > 0) {
        return res.render('banners/new', {
          formData: createBannerDto, // 이전에 입력한 데이터 유지
          actionTypes: Object.values(BannerActionType),
          isEdit: false,
          error: errors.join('<br>'),
        });
      }

      // 배너의 최대 displayOrder 찾기
      const maxDisplayOrder =
        this.banners.length > 0
          ? Math.max(...this.banners.map((b) => b.displayOrder || 0))
          : 0;

      // 새 배너 추가 (항상 마지막 순서로)
      const newBanner: Banner = {
        id: this.getNextId(),
        actionType: createBannerDto.actionType as BannerActionType,
        imageUrl: `/imgs/${file.filename}`,
        displayOrder: maxDisplayOrder + 1, // 항상 마지막 순서
      };

      // 액션 타입이 LINK인 경우에만 URL 포함
      if (createBannerDto.actionType === BannerActionType.LINK) {
        newBanner.actionUrl = createBannerDto.actionUrl;
      }

      this.banners.push(newBanner);

      // JSON 파일에 저장
      await this.saveBannersToJson();

      // 리스트 페이지로 리다이렉트
      return res.redirect('/admin/banners');
    } catch (error) {
      return res.render('banners/new', {
        formData: createBannerDto, // 이전에 입력한 데이터 유지
        actionTypes: Object.values(BannerActionType),
        isEdit: false,
        error: '배너 등록 중 오류가 발생했습니다: ' + error.message,
      });
    }
  }

  @Get('edit/:id')
  @Render('banners/edit')
  async edit(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    // 최신 배너 데이터 로드
    await this.loadBannersFromJson();

    const banner = this.banners.find((b) => b.id === id);

    if (!banner) {
      return res.redirect('/admin/banners');
    }

    return {
      formData: banner, // 배너 데이터를 formData로 전달
      actionTypes: Object.values(BannerActionType),
      isEdit: true,
      bannerId: id,
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
    // 최신 배너 데이터 로드
    await this.loadBannersFromJson();

    const bannerIndex = this.banners.findIndex((b) => b.id === id);

    if (bannerIndex === -1) {
      return res.redirect('/admin/banners');
    }

    try {
      const errors: string[] = [];
      const currentBanner = this.banners[bannerIndex];

      if (!updateBannerDto.actionType) {
        errors.push('액션 타입은 필수입니다.');
      }

      if (
        updateBannerDto.actionType === BannerActionType.LINK &&
        !updateBannerDto.actionUrl
      ) {
        errors.push('외부링크 타입은 액션 URL이 필수입니다.');
      }

      // 타입 변경 시 중복 검사
      if (
        updateBannerDto.actionType !== BannerActionType.LINK &&
        updateBannerDto.actionType !== currentBanner.actionType
      ) {
        const existingBanner = this.banners.find(
          (banner) =>
            banner.actionType === updateBannerDto.actionType &&
            banner.id !== id,
        );

        if (existingBanner) {
          errors.push(
            `${this.getActionTypeLabel(updateBannerDto.actionType)} 타입의 배너는 이미 등록되어 있습니다. 각 타입당 하나의 배너만 등록 가능합니다.`,
          );
        }
      }

      if (errors.length > 0) {
        return res.render('banners/edit', {
          formData: { ...currentBanner, ...updateBannerDto },
          actionTypes: Object.values(BannerActionType),
          isEdit: true,
          bannerId: id,
          error: errors.join('<br>'),
        });
      }

      // 기존 배너 정보 업데이트 - displayOrder는 건드리지 않음
      this.banners[bannerIndex] = {
        ...this.banners[bannerIndex],
        actionType: updateBannerDto.actionType as BannerActionType,
        // displayOrder는 기존 값을 유지
        actionUrl:
          updateBannerDto.actionType === BannerActionType.LINK
            ? updateBannerDto.actionUrl
            : undefined,
      };

      // 이미지가 업로드된 경우 이미지 URL 업데이트
      if (file) {
        this.banners[bannerIndex].imageUrl = `/imgs/${file.filename}`;
      }

      // JSON 파일에 저장
      await this.saveBannersToJson();

      return res.redirect('/admin/banners');
    } catch (error) {
      return res.render('banners/edit', {
        formData: this.banners[bannerIndex],
        actionTypes: Object.values(BannerActionType),
        isEdit: true,
        bannerId: id,
        error: '배너 수정 중 오류가 발생했습니다: ' + error.message,
      });
    }
  }

  @Post('update-order')
  async updateOrder(
    @Body() data: { orders: { id: number; order: number }[] },
    @Res() res: Response,
  ) {
    console.log(data);
    try {
      // 현재 배너 데이터 로드
      await this.loadBannersFromJson();

      // 각 배너의 순서 업데이트
      data.orders.forEach((item) => {
        const banner = this.banners.find((b) => b.id === item.id);
        if (banner) {
          banner.displayOrder = item.order;
        }
      });

      // 변경된 데이터 저장
      await this.saveBannersToJson();

      return res.json({ success: true });
    } catch (error) {
      console.error('순서 업데이트 실패:', error);
      return res.status(500).json({
        success: false,
        error: '배너 순서를 업데이트하는 중 오류가 발생했습니다.',
      });
    }
  }

  @Get('destroy/:id')
  async destroy(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    // 최신 배너 데이터 로드
    await this.loadBannersFromJson();

    const bannerIndex = this.banners.findIndex((b) => b.id === id);

    if (bannerIndex !== -1) {
      // 배너 삭제
      this.banners.splice(bannerIndex, 1);

      // JSON 파일에 변경사항 저장
      await this.saveBannersToJson();
    }

    return res.redirect('/admin/banners');
  }

  // JSON 파일에서 배너 데이터 로드
  private async loadBannersFromJson() {
    try {
      const data = await fs.readFile(this.bannerJsonPath, 'utf8');
      this.banners = JSON.parse(data);
      console.log('배너 데이터 로드 완료:', this.banners.length);
    } catch (error) {
      console.error('배너 데이터 로드 실패:', error);
      // 파일이 없거나 오류가 발생한 경우 빈 배열로 초기화
      this.banners = [];
    }
  }

  // 배너 데이터를 JSON 파일에 저장
  private async saveBannersToJson() {
    try {
      await fs.writeFile(
        this.bannerJsonPath,
        JSON.stringify(this.banners, null, 2),
        'utf8',
      );
      console.log('배너 데이터 저장 완료');
    } catch (error) {
      console.error('배너 데이터 저장 실패:', error);
      throw new Error('배너 데이터를 저장하는 중 오류가 발생했습니다.');
    }
  }

  // 다음 ID 생성
  private getNextId(): number {
    return this.banners.length > 0
      ? Math.max(...this.banners.map((banner) => banner.id)) + 1
      : 1;
  }

  // 액션 타입에 따른 레이블 반환
  private getActionTypeLabel(actionType: BannerActionType): string {
    const actionTypeLabels = {
      [BannerActionType.LINK]: '외부링크',
      [BannerActionType.DR]: '국민DR',
      [BannerActionType.PLUS_DR]: '플러스DR',
      [BannerActionType.GUIDE]: '가이드',
    };

    return actionTypeLabels[actionType] || actionType;
  }
}
