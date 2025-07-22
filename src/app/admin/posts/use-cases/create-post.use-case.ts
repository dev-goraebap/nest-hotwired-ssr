import { BadRequestException, Injectable } from '@nestjs/common';
import { EntityManager, In } from 'typeorm';

import { CreatePostDto } from '../dto/create-post.dto';

import { ActiveStorageService } from 'src/libs/typeorm-active-storage';
import {
  PostEntity,
  PostTranslationEntity,
  TagEntity,
  TranslationService,
} from 'src/shared';

@Injectable()
export class CreatePostUseCase {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly translationService: TranslationService,
    private readonly activeStorageService: ActiveStorageService,
  ) {}

  async execute(dto: CreatePostDto, file?: Express.Multer.File) {
    // 존재하는 테그만 추리기
    const tagIds = dto.tags.map((x) => x.id);
    const tags = await TagEntity.find({
      where: { id: In(tagIds) },
    });

    // 태그가 하나도 없으면 게시물 생성 제한
    if (tags.length === 0) {
      console.log('하나 이상의 태그가 필요함');
      throw new BadRequestException('하나 이상의 태그가 필요함');
    }

    // 동일한 제목의 게시물이 있을 경우 생성 제한
    const existPostTranslation = await PostTranslationEntity.exists({
      where: { languageCode: 'ko', title: dto.title },
    });
    if (existPostTranslation) {
      console.log('동일한 제목의 게시물이 이미 존재함');
      throw new BadRequestException('동일한 제목의 게시물이 이미 존재함');
    }

    // 동일한 슬러그의 게시물이 있을 경우 생성 제한
    const existPost = await PostEntity.exists({
      where: { slug: dto.slug },
    });
    if (existPost) {
      console.log('동일한 슬러그 게시물이 이미 존재함');
      throw new BadRequestException('동일한 슬러그 게시물이 이미 존재함');
    }

    // -------------------------------------------------------------------------------
    // <외부 연계 (Translate 서비스에 의존적)>
    // NOTE: 영문용 title, content 추출
    // -------------------------------------------------------------------------------
    const enTitle = await this.translationService.translateToEnglish(dto.title);
    const enContent = await this.translationService.translateHtmlContent(
      dto.content,
      'english',
    );

    const koPostTranslation = PostTranslationEntity.create({
      languageCode: 'ko',
      title: dto.title,
      content: dto.content,
    });
    const enPostTranslation = PostTranslationEntity.create({
      languageCode: 'en',
      title: enTitle,
      content: enContent,
    });
    let post = PostEntity.create({
      slug: dto.slug,
      tags: tags,
      translations: [koPostTranslation, enPostTranslation],
    });

    // 트랜잭션 단위: 게시물 생성 및 파일이 있을 경우 첨부파일 생성
    await this.entityManager.transaction(async () => {
      post = await post.save();

      // -------------------------------------------------------------------------------
      // <외부 연계 (ActiveStorage 서비스에 의존적)>
      // STEP1: 파일이 없는 경우 프로세스 종료
      // STEP2: 파일 저장 및 게시물 첨부 파일 레코드 생성
      // -------------------------------------------------------------------------------
      if (!file) return;
      await this.activeStorageService.attach(
        file,
        'post',
        String(post.id),
        'thumbnail',
      );
    });
  }
}
