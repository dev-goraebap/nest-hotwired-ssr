# 프로젝트 메모리

## 프로젝트 개요
- **프로젝트명**: nestjs-mvc-is-coming
- **버전**: 0.8.1
- **기술 스택**: NestJS + MVC 패턴, TypeORM, SQLite, Edge 템플릿
- **개발자**: dev.goraebap

## 주요 구조
### 백엔드 (src/)
- **Framework**: NestJS with MVC pattern
- **Database**: SQLite with TypeORM
- **Validation**: Zod (최근 class-validator에서 마이그레이션)
- **주요 모듈**:
  - `app/admin/`: 관리자 기능 (카테고리, 문서, 포스트 관리)
  - `app/public/`: 공개 페이지 (홈, 세션, 문서 조회)
  - `shared/`: 공통 엔티티 및 서비스 (Post, Tag, Series 포함)
  - `common/`: 필터, 가드, 인터셉터, 파이프
  - `libs/typeorm-active-storage/`: 커스텀 파일 업로드 라이브러리 (Local + GCS)

### 프론트엔드 (resources/)
- **템플릿 엔진**: Edge
- **JS Framework**: Stimulus.js
- **CSS**: Tailwind CSS
- **빌드 도구**: Vite

## 엔티티 구조
### 기존 엔티티
- **Document**: 문서 관리 (slug, translations, category 관계)
- **Category**: 카테고리 관리 (order, translations)

### 새로 추가된 엔티티
- **Post**: 블로그 포스트 (slug, isPublished, publishedAt, series 관계, tags 관계)
- **Tag**: 태그 시스템 (slug, color, posts와 ManyToMany)
- **Series**: 시리즈 관리 (slug, isCompleted, posts와 OneToMany)
- **Translation**: 각 엔티티별 다국어 번역 지원

### 관계 설계

```
Post ←→ Series (ManyToOne - 선택적)
Post ←→ Tag (ManyToMany)
Series는 Tag와 독립적
모든 엔티티는 Translation 엔티티와 OneToMany 관계
```

## 아키텍처 패턴
### Use-Case 레이어
- **위치**: `use-cases/` 폴더
- **역할**: 복잡한 비즈니스 워크플로우 조율
- **패턴**: Clean Architecture의 Application Service
- **특징**:
  - 트랜잭션 경계 관리
  - 여러 서비스 조율 (DocumentsService + TranslationService + ValidationService)
  - 병렬 처리 (한/영 번역 동시 생성)
  - 에러 핸들링

### 참조 방향

```
Controller → Use-Case → Services → Entities
```

## 파일 업로드 시스템 (Active Storage)
### 지원 어댑터
- **LocalStorageAdapter**: 로컬 파일 시스템
- **GcsStorageAdapter**: Google Cloud Storage (신규 추가)

### 주요 기능
- 파일 중복 제거 (MD5 체크섬)
- 계층적 디렉토리 구조 (`ab/cd/abcdef...`)
- Polymorphic 파일 첨부 (어떤 엔티티든 파일 첨부 가능)
- 자동 가비지 컬렉션

### 설정
- 환경변수로 어댑터 선택 (`serviceType: 'local' | 'gcs'`)
- GCS 설정: `projectId`, `keyFilename`, `bucketName`

## 다국어 지원
### Translation Service
- **Google Gemini AI** 기반 자동 번역
- HTML 콘텐츠 번역 지원
- 한국어 → 영어 자동 변환

### 번역 전략
- 생성/수정 시 자동으로 한/영 번역 생성
- 병렬 처리로 성능 최적화
- 번역 실패 시 상세한 에러 메시지

## 테스트 전략
### 접근 방식
- **클래시스트(Classicist) 방식** 채택
- 복잡한 비즈니스 로직이 포함된 use cases에 집중
- 테스트 비용 효율성을 중시하여 의미 있는 케이스만 선별적으로 테스트

### 테스트 구조
- **실제 사용**: 비즈니스 로직 서비스들, 데이터베이스(테스트용 SQLite/in-memory), Use-Case 레이어, 도메인 객체 상호작용
- **Mock 처리**: 외부 인프라(파일 업로드 - S3/GCS, Google Gemini 번역 API, 이메일 발송 등)

### NestJS 테스팅 모듈 활용

```typescript
// 실제 DI 컨테이너 구성
Test.createTestingModule({
  imports: [TypeOrmModule.forRoot(/* 인메모리 DB */)],
  providers: [
    // 실제 서비스들
    DocumentsService,
    TranslationService, 
    // 외부 의존성만 Mock
    { provide: StorageService, useValue: mockStorageService },
    { provide: GeminiService, useValue: mockGeminiService }
  ]
})
```

## 개발 환경
- **개발 서버**: `npm run start:dev`
- **리소스 빌드**: `npm run start:resource`
- **테스트**: `npm run test`
- **린트**: `npm run lint`

## 코드 품질
### ESLint 설정
- TypeScript strict 모드
- 타입 안전성 강화
- `any` 타입 사용 시 ESLint 주석으로 명시적 허용

### 개발 규칙
- Use-Case 패턴으로 복잡한 로직 분리
- 트랜잭션 안전성 보장
- 에러 처리 일관성 유지

## 최근 작업
- Post, Tag, Series 엔티티 추가
- Google Cloud Storage 어댑터 구현
- Use-Case 아키텍처 도입 및 검증
- ESLint 에러 139개 → 0개 해결 (타입 안전성 개선)
- 시리즈 기능 설계 완료
- 테스트 전략 수립 (클래시스트 방식, 복잡한 케이스 중심)

## Git 정보
- **현재 브랜치**: develop
- **메인 브랜치**: develop