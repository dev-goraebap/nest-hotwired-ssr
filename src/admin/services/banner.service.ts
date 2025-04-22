import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Result } from '../common/result';
import { BannerEntity } from '../entities/banner.entity';

export enum BannerActionType {
  LINK = 'LINK',
  DR = 'DR',
  PLUS_DR = 'PLUS_DR',
  GUIDE = 'GUIDE',
}

export interface CreateBannerDto {
  actionType: BannerActionType;
  actionUrl?: string;
  imageUrl: string;
  displayOrder?: number;
}

export interface UpdateBannerDto {
  actionType?: BannerActionType;
  actionUrl?: string;
  imageUrl?: string;
  displayOrder?: number;
}

@Injectable()
export class BannerService {
  constructor(
    @InjectRepository(BannerEntity)
    private readonly repository: Repository<BannerEntity>,
  ) {}

  // 데이터 조회 메소드
  async getAll(): Promise<Result<BannerEntity[]>> {
    try {
      const banners = await this.repository.find({
        order: {
          displayOrder: 'ASC',
        },
      });
      return Result.success(banners, '배너 목록을 성공적으로 조회했습니다.');
    } catch (error) {
      return Result.failure('배너 목록 조회 중 오류가 발생했습니다.');
    }
  }

  async getOne(id: number): Promise<Result<BannerEntity>> {
    try {
      const banner = await this.repository.findOne({ where: { id } });
      return Result.from(banner, `ID가 ${id}인 배너를 찾을 수 없습니다.`);
    } catch (error) {
      return Result.failure(
        `배너 조회 중 오류가 발생했습니다: ${error.message}`,
      );
    }
  }

  async getByActionType(
    actionType: BannerActionType,
  ): Promise<Result<BannerEntity | null>> {
    try {
      const banner = await this.repository.findOne({
        where: { actionType },
      });
      return Result.success(banner); // 없어도 성공으로 처리 (존재 여부 확인용)
    } catch (error) {
      return Result.failure(
        `액션 타입으로 배너 조회 중 오류가 발생했습니다: ${error.message}`,
      );
    }
  }

  // 데이터 생성/수정/삭제 메소드
  async create(dto: CreateBannerDto): Promise<Result<BannerEntity>> {
    try {
      let displayOrder = dto.displayOrder;

      // displayOrder가 제공되지 않은 경우 현재 최대 값 + 1 사용
      if (!displayOrder) {
        const maxOrderBanner = await this.repository.findOne({
          order: { displayOrder: 'DESC' },
          where: {},
        });
        displayOrder = maxOrderBanner ? maxOrderBanner.displayOrder + 1 : 1;
      }

      const banner = this.repository.create({
        ...dto,
        displayOrder,
      });

      const savedBanner = await this.repository.save(banner);
      return Result.success(savedBanner, '배너가 성공적으로 등록되었습니다.');
    } catch (error) {
      return Result.failure(
        `배너 등록 중 오류가 발생했습니다: ${error.message}`,
      );
    }
  }

  async update(
    id: number,
    dto: UpdateBannerDto,
  ): Promise<Result<BannerEntity | null>> {
    try {
      const updateResult = await this.repository.update(id, dto);

      if (updateResult.affected === 0) {
        return Result.failure(`ID가 ${id}인 배너를 찾을 수 없습니다.`);
      }

      const updatedBanner = await this.repository.findOne({
        where: { id },
      });
      return Result.success(updatedBanner, '배너가 성공적으로 수정되었습니다.');
    } catch (error) {
      return Result.failure(
        `배너 수정 중 오류가 발생했습니다: ${error.message}`,
      );
    }
  }

  async delete(id: number): Promise<Result<void>> {
    try {
      const result = await this.repository.delete(id);

      if (result.affected === 0) {
        return Result.failure(`ID가 ${id}인 배너를 찾을 수 없습니다.`);
      }

      return Result.success(null, '배너가 성공적으로 삭제되었습니다.');
    } catch (error) {
      return Result.failure(
        `배너 삭제 중 오류가 발생했습니다: ${error.message}`,
      );
    }
  }

  async updateOrder(
    orders: { id: number; order: number }[],
  ): Promise<Result<void>> {
    try {
      // 트랜잭션 사용하여 모든 순서 업데이트를 원자적으로 처리
      await this.repository.manager.transaction(async (manager) => {
        for (const item of orders) {
          await manager.update(BannerEntity, item.id, {
            displayOrder: item.order,
          });
        }
      });

      return Result.success(null, '배너 순서가 성공적으로 업데이트되었습니다.');
    } catch (error) {
      return Result.failure(
        `배너 순서 업데이트 중 오류가 발생했습니다: ${error.message}`,
      );
    }
  }

  // 검증 메소드
  async validateCreate(
    createBannerDto: any,
    file: Express.Multer.File,
  ): Promise<Result<CreateBannerDto>> {
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
      const existingBannerResult = await this.getByActionType(
        createBannerDto.actionType as BannerActionType,
      );

      if (existingBannerResult.data) {
        errors.push(
          `${this.getActionTypeLabel(createBannerDto.actionType)} 타입의 배너는 이미 등록되어 있습니다. 각 타입당 하나의 배너만 등록 가능합니다.`,
        );
      }
    }

    if (errors.length > 0) {
      return Result.failure(errors);
    }

    // 배너 생성 DTO 준비
    const newBannerData: CreateBannerDto = {
      actionType: createBannerDto.actionType as BannerActionType,
      imageUrl: file ? `/public/imgs/${file.filename}` : '',
    };

    // 액션 타입이 LINK인 경우에만 URL 포함
    if (createBannerDto.actionType === BannerActionType.LINK) {
      newBannerData.actionUrl = createBannerDto.actionUrl;
    }

    return Result.success(newBannerData, '배너 데이터가 유효합니다.');
  }

  async validateUpdate(
    updateBannerDto: any,
    file: Express.Multer.File,
    currentBanner: BannerEntity,
    id: number,
  ): Promise<Result<UpdateBannerDto>> {
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

    // 타입 변경 시 중복 검사
    if (
      updateBannerDto.actionType !== BannerActionType.LINK &&
      updateBannerDto.actionType !== currentBanner.actionType
    ) {
      const existingBannerResult = await this.getByActionType(
        updateBannerDto.actionType as BannerActionType,
      );

      if (existingBannerResult.data && existingBannerResult.data.id !== id) {
        errors.push(
          `${this.getActionTypeLabel(updateBannerDto.actionType)} 타입의 배너는 이미 등록되어 있습니다. 각 타입당 하나의 배너만 등록 가능합니다.`,
        );
      }
    }

    if (errors.length > 0) {
      return Result.failure(errors);
    }

    // 업데이트 데이터 준비
    const updateData: UpdateBannerDto = {
      actionType: updateBannerDto.actionType,
    };

    // 액션 타입이 LINK인 경우에만 URL 추가
    if (updateBannerDto.actionType === BannerActionType.LINK) {
      updateData.actionUrl = updateBannerDto.actionUrl;
    } else {
      updateData.actionUrl = undefined; // LINK가 아니면 URL 제거
    }

    // 이미지가 업로드된 경우에만 업데이트
    if (file) {
      updateData.imageUrl = `/public/imgs/${file.filename}`;
    }

    return Result.success(updateData, '배너 수정 데이터가 유효합니다.');
  }

  // UI 헬퍼 메소드
  getActionTypeLabel(actionType: BannerActionType): string {
    const actionTypeLabels = {
      [BannerActionType.LINK]: '외부링크',
      [BannerActionType.DR]: '국민DR',
      [BannerActionType.PLUS_DR]: '플러스DR',
      [BannerActionType.GUIDE]: '가이드',
    };

    return actionTypeLabels[actionType] || actionType;
  }

  getActionTypeColors(): Record<BannerActionType, string> {
    return {
      [BannerActionType.LINK]: 'bg-blue-500',
      [BannerActionType.DR]: 'bg-indigo-500',
      [BannerActionType.PLUS_DR]: 'bg-yellow-500',
      [BannerActionType.GUIDE]: 'bg-green-500',
    };
  }

  getActionTypeLabels(): Record<BannerActionType, string> {
    return {
      [BannerActionType.LINK]: '외부링크',
      [BannerActionType.DR]: '국민DR',
      [BannerActionType.PLUS_DR]: '플러스DR',
      [BannerActionType.GUIDE]: '가이드',
    };
  }
}
