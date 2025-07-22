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
  - `app/admin/`: 관리자 기능 (카테고리, 문서 관리)
  - `app/public/`: 공개 페이지 (홈, 세션, 문서 조회)
  - `shared/`: 공통 엔티티 및 서비스
  - `common/`: 필터, 가드, 인터셉터, 파이프
  - `libs/typeorm-active-storage/`: 커스텀 파일 업로드 라이브러리

### 프론트엔드 (resources/)
- **템플릿 엔진**: Edge
- **JS Framework**: Stimulus.js
- **CSS**: Tailwind CSS
- **빌드 도구**: Vite

## 주요 기능
- 문서 관리 시스템 (CRUD)
- 카테고리 관리
- 다국어 지원 (한국어/영어)
- 파일 업로드 (Active Storage)
- 세션 관리 및 인증
- CSRF 보호

## 개발 환경
- **개발 서버**: `npm run start:dev`
- **리소스 빌드**: `npm run start:resource`
- **테스트**: `npm run test`
- **린트**: `npm run lint`

## 최근 작업
- Zod 유효성 검증 방식으로 변경 완료
- 문서 저장 로직 개선
- 기본 validation에서 Zod pipe 방식으로 전환

## Git 정보
- **현재 브랜치**: develop
- **메인 브랜치**: develop