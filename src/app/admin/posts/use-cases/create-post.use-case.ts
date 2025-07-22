import { BadRequestException, Injectable } from '@nestjs/common';
import { In } from 'typeorm';

import { CreatePostDto } from '../dto/create-post.dto';

import {
  PostEntity,
  PostTranslationEntity,
  TagEntity,
  TranslationService,
} from 'src/shared';

@Injectable()
export class CreatePostUseCase {
  constructor(private readonly translationService: TranslationService) {}

  async execute(dto: CreatePostDto) {
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

    // 트랜잭션 단위: PostEntity측의 cascade로 일괄 생성 처리
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
    const post = PostEntity.create({
      slug: dto.slug,
      tags: tags,
      translations: [koPostTranslation, enPostTranslation],
    });
    await post.save();
  }
}
