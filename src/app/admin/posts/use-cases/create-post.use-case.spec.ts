import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  PostEntity,
  PostTranslationEntity,
  SeriesEntity,
  SeriesTranslationEntity,
  TagEntity,
  TagTranslationEntity,
  TranslationService,
} from 'src/shared';

import {
  ActiveStorageService,
  AttachmentEntity,
} from 'src/libs/typeorm-active-storage';
import { CreatePostUseCase } from './create-post.use-case';

void describe('CreatePostUseCase', () => {
  // ---------------------------------------------
  // 초기 설정
  // ---------------------------------------------
  let createPostUseCase: CreatePostUseCase;

  beforeEach(async () => {
    const mockTranslationService = {
      translateToEnglish: jest.fn().mockResolvedValue('Test Post Title'),
      translateHtmlContent: jest
        .fn()
        .mockResolvedValue('<h1>Test Post Title</h1><p>Test content</p>'),
    };
    const mockActiveStorageService = {
      attach: jest.fn().mockResolvedValue(new AttachmentEntity()),
    };

    const module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          entities: [
            PostEntity,
            PostTranslationEntity,
            SeriesEntity,
            SeriesTranslationEntity,
            TagEntity,
            TagTranslationEntity,
          ],
          synchronize: true,
          dropSchema: true,
          logging: false,
        }),
      ],
      providers: [
        CreatePostUseCase,
        {
          provide: TranslationService,
          useValue: mockTranslationService,
        },
        {
          provide: ActiveStorageService,
          useValue: mockActiveStorageService,
        },
      ],
    }).compile();
    createPostUseCase = module.get(CreatePostUseCase);

    // id:1 의 태그를 미리 생성
    const tagTranslation = TagTranslationEntity.create({
      languageCode: 'ko',
      name: 'testTag',
      description: 'test tag',
    });
    const tag = TagEntity.create({
      slug: 'test-tag',
      color: '#000000',
      translations: [tagTranslation],
    });
    await tag.save();
  });

  // ---------------------------------------------
  // 테스트 항목
  // ---------------------------------------------

  void it('게시물 생성 성공 (파일 첨부 테스트 제외)', async () => {
    await createPostUseCase.execute({
      title: '게시물 제목',
      content: '<h1>게시물 제목</h1><p>게시물 내용</p>',
      slug: 'test-post',
      tags: [{ id: 1 }],
    });

    // 게시물 생성 확인
    const post = await PostEntity.findOne({
      where: { slug: 'test-post' },
      relations: ['translations', 'tags'],
      order: {
        translations: {
          languageCode: 'DESC', // ko, en 순
        },
      },
    });
    if (!post) return expect(false);

    console.log(post);
    expect(post).toBeTruthy();
    expect(post.slug).toBe('test-post');

    // 한국어 번역 확인
    const koTranslation = post.translations[0];
    if (!koTranslation) return expect(false);
    expect(koTranslation).toBeTruthy();
    expect(koTranslation.title).toBe('게시물 제목');
    expect(koTranslation.content).toBe(
      '<h1>게시물 제목</h1><p>게시물 내용</p>',
    );

    // 영어 번역 확인 (Mock 값)
    const enTranslation = post.translations[1];
    if (!enTranslation) return expect(false);
    expect(enTranslation).toBeTruthy();
    expect(enTranslation.title).toBe('Test Post Title');
    expect(enTranslation.content).toBe(
      '<h1>Test Post Title</h1><p>Test content</p>',
    );

    // 태그 연결 확인
    expect(post.tags).toHaveLength(1);
    expect(post.tags[0].id).toBe(1);
  });

  void it('태그가 하나도 없으면 게시물 생성 제한', async () => {
    const errorResult = createPostUseCase.execute({
      title: '게시물 제목',
      content: '<h1>게시물 제목</h1><p>게시물 내용</p>',
      slug: 'test-post',
      tags: [],
    });
    await expect(errorResult).rejects.toThrow(BadRequestException);
  });

  void it('동일한 제목의 게시물이 존재하면 생성 제한', async () => {
    // 미리 제목이 겹치는 게시물 데이터 생성
    const sameTitle = '게시물 제목';
    const testPostTranslation = PostTranslationEntity.create({
      title: sameTitle,
      content: '',
      languageCode: 'ko',
    });
    await testPostTranslation.save();

    // 테스트
    const errorResult = createPostUseCase.execute({
      title: sameTitle,
      content: '<h1>게시물 제목</h1><p>게시물 내용</p>',
      slug: 'test-post',
      tags: [{ id: 1 }],
    });
    await expect(errorResult).rejects.toThrow(BadRequestException);
  });

  void it('동일한 슬러그가 존재하면 생성 제한', async () => {
    // 미리 슬러그가 겹치는 게시물 데이터 생성
    const sameSlug = 'test-post-1';
    const testPost = PostEntity.create({
      slug: sameSlug,
    });
    await testPost.save();

    // 테스트
    const errorResult = createPostUseCase.execute({
      title: '테스트 게시물',
      content: '<h1>게시물 제목</h1><p>게시물 내용</p>',
      slug: sameSlug,
      tags: [{ id: 1 }],
    });
    await expect(errorResult).rejects.toThrow(BadRequestException);
  });
});
