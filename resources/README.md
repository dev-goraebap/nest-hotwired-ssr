# resources 디렉토리 가이드

`resources` 디렉토리는 KEPCOPLUG 관리자 페이지 구현을 위한 프론트엔드 리소스를 포함하고 있습니다. 해당 디렉토리는 MVC 패턴의 View 영역을 담당하며, 사용자 인터페이스와 클라이언트 측 로직을 구성합니다.

## 디렉토리 구조

```
resources/
├── public/              # 정적 자산 (이미지, CSS 파일, js 등등)
└── views/               # 템플릿 파일 (.ejs)
    ├── banners/         # 배너 관리 페이지 템플릿
    ├── dr-notices/      # DR 공지사항 페이지 템플릿
    ├── partials/        # 전역 공유 파셜(부분) 템플릿
    │   ├── _head.ejs    # 페이지 헤드 영역
    │   └── _sidebar.ejs # 사이드바 내비게이션
    └── users/           # 사용자 관리 페이지 템플릿
```

## 네이밍 규칙과 컨벤션

### 뷰 템플릿 파일

- 뷰 템플릿은 컨트롤러의 메서드와 일치하는 네이밍 컨벤션을 따릅니다:
  - `index.ejs` - 목록 조회 페이지
  - `new.ejs` - 생성 폼 페이지
  - `edit.ejs` - 수정 폼 페이지
  - `show.ejs` - 상세 조회 페이지

### 파셜(Partial) 템플릿

- 파셜 파일은 이름 앞에 언더스코어(`_`)가 붙습니다:
  - 예: `_form.ejs`, `_delete-modal.ejs`

- **파셜 위치에 따른 용도**:
  - `views/[리소스명]/` 내부의 파셜: 해당 리소스 페이지에서만 사용
    - 예: `views/banners/_form.ejs` - 배너 생성/수정에서만 사용됨
  - `views/partials/` 내부의 파셜: 여러 페이지에서 공통적으로 사용
    - 예: `views/partials/_sidebar.ejs` - 모든 페이지에서 공통으로 사용되는 사이드바

## 사용 중인 프론트엔드 기술

### Turbo

Turbo는 SSR(Server-Side Rendering) 페이지에서 CSR(Client-Side Rendering)처럼 부드러운 페이지 전환과 부분 업데이트를 가능하게 합니다. 이는 페이지 이동 시 전체 페이지를 다시 로드하지 않고 필요한 부분만 교체하여 사용자 경험을 향상시킵니다.

> **참고**: 현재 프로젝트에서는 Turbo가 페이지 이동 시 자동으로 작동하도록 구성되어 있어, 개발자가 소스 코드로 직접 제어하는 부분은 거의 없습니다. 기본 설정만으로도 충분히 동작하므로 별도의 코드 수정 없이 사용할 수 있습니다.

### Stimulus

Stimulus는 서버 사이드 렌더링된 HTML에 자바스크립트 동작을 추가할 때 사용하는 경량 프레임워크입니다. 복잡한 상태 관리 없이 HTML 요소에 인터랙티브한 기능을 쉽게 추가할 수 있도록 해주는 유틸리티 라이브러리입니다.

주요 특징:
- HTML 마크업에 `data-controller`, `data-action`, `data-target` 속성을 통해 자바스크립트 연결
- 각 기능별로 분리된 컨트롤러로 요구사항별 재사용 용이

## 개발 가이드라인

1. 새 페이지 추가 시:
   - 적절한 리소스 폴더에 템플릿 파일 추가 (예: `views/[리소스명]/index.ejs`)
   - 해당 페이지만의 파셜은 같은 폴더 내에 언더스코어로 시작하는 파일로 생성

2. 공통 UI 요소 추가 시:
   - `views/partials/` 폴더에 언더스코어로 시작하는 파일 추가
   - 필요한 페이지에서 include 문으로 포함 (예: `<%- include('../partials/_header.ejs') %>`)

3. 클라이언트 측 동작 추가 시:
   - `/public/js/controllers/` 폴더에 새 Stimulus 컨트롤러 추가
   - `/public/js/controllers/index.js`에 해당 컨트롤러 등록

## 추가 정보

Turbo와 Stimulus는 모두 Hotwired 프레임워크의 일부로, 공식 사이트에서 자세한 문서를 확인할 수 있습니다. 두 라이브러리 모두 사용 방법이 직관적이고 간단하여 빠르게 학습할 수 있습니다.

- Hotwired 공식 문서: [https://hotwired.dev/](https://hotwired.dev/)
- Turbo 문서: [https://turbo.hotwired.dev/](https://turbo.hotwired.dev/)
- Stimulus 문서: [https://stimulus.hotwired.dev/](https://stimulus.hotwired.dev/)