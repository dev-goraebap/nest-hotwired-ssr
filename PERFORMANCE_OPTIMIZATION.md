# 웹 성능 최적화 가이드

이 문서는 NestJS MVC 프로젝트에서 Lighthouse 성능 점수를 56점에서 99점으로 향상시키기 위해 적용한 최적화 기법들을 상세히 설명합니다.

## 목차
1. [문제 상황](#문제-상황)
2. [정적 애셋 캐싱 최적화](#1-정적-애셋-캐싱-최적화)
3. [렌더링 차단 리소스 최적화](#2-렌더링-차단-리소스-최적화)
4. [폰트 로딩 최적화](#3-폰트-로딩-최적화)
5. [압축 최적화](#4-압축-최적화)
6. [결과](#결과)

---

## 문제 상황

### 초기 Lighthouse 점수: 56점

주요 문제점들:
- **효율적인 캐시 정책 부재**: 정적 애셋의 캐시 TTL이 4시간으로 너무 짧음
- **렌더링 차단 리소스**: CSS/JS 파일이 페이지 렌더링을 2.28초 지연
- **폰트 로딩 최적화 부족**: `font-display` 설정 누락으로 FOIT 발생

---

## 1. 정적 애셋 캐싱 최적화

### 문제
정적 파일들의 캐시 TTL이 4시간으로 설정되어 재방문 시 불필요한 네트워크 요청 발생

### 기존 코드
```typescript
// src/main.ts
app.useStaticAssets(join(process.cwd(), 'resources', 'assets'), {
  prefix: '/public', // 외부 접근 경로는 public으로 설정 (별 이유없음)
});
```

### 개선된 코드
```typescript
// src/main.ts
// 정적 애셋 설정 (캐시 헤더 포함)
const cacheTime = {
  oneYear: 31536000,    // 1년 (초)
  oneMonth: 2592000,    // 30일 (초)
  oneWeek: 604800       // 1주일 (초)
};

app.useStaticAssets(join(process.cwd(), 'resources', 'assets'), {
  prefix: '/public',
  maxAge: cacheTime.oneYear * 1000, // 밀리초로 변환
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    // 파일 확장자별 캐시 정책
    if (path.endsWith('.ttf') || path.endsWith('.woff') || path.endsWith('.woff2')) {
      // 폰트 파일: 1년
      res.setHeader('Cache-Control', `public, max-age=${cacheTime.oneYear}, immutable`);
    } else if (path.endsWith('.js') || path.endsWith('.css')) {
      // JS/CSS 파일: 1년 (빌드 시 해시가 포함되므로)
      res.setHeader('Cache-Control', `public, max-age=${cacheTime.oneYear}, immutable`);
    } else if (path.endsWith('.jpg') || path.endsWith('.jpeg') || path.endsWith('.png') || path.endsWith('.gif') || path.endsWith('.svg')) {
      // 이미지 파일: 30일
      res.setHeader('Cache-Control', `public, max-age=${cacheTime.oneMonth}`);
    } else {
      // 기타 파일: 1주일
      res.setHeader('Cache-Control', `public, max-age=${cacheTime.oneWeek}`);
    }
  }
});
```

### 개선 효과
- **폰트 파일**: 4시간 → 1년 (8760배 증가)
- **JS/CSS 파일**: 4시간 → 1년 + `immutable` 지시어
- **이미지 파일**: 30일 캐시
- **재방문 시 로딩 속도 대폭 향상**

### `immutable` 지시어란?
`immutable`은 HTTP 캐시 제어 지시어 중 하나로, 해당 리소스가 **절대 변경되지 않는다**는 것을 브라우저에 알려줍니다.

```http
Cache-Control: public, max-age=31536000, immutable
```

#### immutable의 동작 방식
- **일반적인 캐시**: 만료 기간 전이라도 새로고침(F5) 시 서버에 재검증 요청
- **immutable 설정**: 만료 기간 전까지는 **절대** 서버에 요청하지 않음
- **적용 조건**: 파일명에 해시값이 포함되어 내용 변경 시 파일명도 변경되는 경우

#### 예시 시나리오
```
빌드 결과:
- app.js (해시 없음) → app.a1b2c3.js (해시 포함)
- 내용 변경 시 → app.d4e5f6.js (새로운 해시)
```

### HTTP 응답 헤더 설정 방식
위 코드에서 `res.setHeader()`는 각 파일 요청 시 **서버가 응답 헤더를 설정**하는 방식입니다:

```typescript
setHeaders: (res, path) => {
  if (path.endsWith('.js') || path.endsWith('.css')) {
    // 각 JS/CSS 파일 요청 시 아래 헤더가 응답에 포함됨
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
}
```

#### 실제 HTTP 응답 예시
```http
HTTP/1.1 200 OK
Content-Type: application/javascript
Cache-Control: public, max-age=31536000, immutable
Content-Length: 45678
...

// app.js 파일 내용
```

#### 브라우저에서 확인하는 방법
1. **개발자 도구 → Network 탭**
2. **파일 클릭 → Response Headers 확인**
3. **`Cache-Control: public, max-age=31536000, immutable` 확인**

---

## 2. 렌더링 차단 리소스 최적화

### 문제
CSS와 JavaScript 파일이 페이지의 First Paint를 차단하여 2.28초의 지연 발생

### 기존 코드
```html
<!-- resources/views/layouts/app.edge -->
<head>
  <!-- 에셋파이프라인을 통해 빌드되는 자산 파일들 -->
  <script src="/public/builds/app.js"></script>
  <link rel="stylesheet" href="/public/builds/tailwind.css">
  
  <!-- 일반 자산 파일들 -->
  <link rel="stylesheet" href="/public/stylesheets/font.css">
</head>
```

### 개선된 코드
```html
<!-- resources/views/layouts/app.edge -->
<head>
  <!-- Critical CSS 인라인 (폰트만 먼저) -->
  <style>
    @font-face {
      font-display: swap;
      font-family: "OpenSans";
      src: url("/public/fonts/OpenSans-Regular.ttf");
      font-weight: 500;
    }
    html {
      font-family: "OpenSans", sans-serif !important;
    }
  </style>

  <!-- 리소스 프리로딩 -->
  <link rel="preload" href="/public/builds/tailwind.css" as="style" onload="this.onload=null;this.rel='stylesheet'" />
  <link rel="preload" href="/public/fonts/OpenSans-Regular.ttf" as="font" type="font/ttf" crossorigin />

  <!-- CSS 비동기 로딩을 위한 폴백 -->
  <noscript><link rel="stylesheet" href="/public/builds/tailwind.css"></noscript>

  <!-- 폰트 CSS는 지연 로딩 -->
  <link rel="preload" href="/public/stylesheets/font.css" as="style" onload="this.onload=null;this.rel='stylesheet'" />
  <noscript><link rel="stylesheet" href="/public/stylesheets/font.css" /></noscript>

  <!-- JavaScript는 defer로 지연 -->
  <script src="/public/builds/app.js" defer></script>
</head>
```

### 최적화 기법 설명

#### Critical CSS 인라인화
- **목적**: 초기 렌더링에 필요한 최소 CSS를 HTML에 직접 포함
- **효과**: CSS 파일 다운로드를 기다리지 않고 즉시 렌더링 시작

#### 리소스 프리로딩 (Resource Preloading)
```html
<link rel="preload" href="/public/builds/tailwind.css" as="style" onload="this.onload=null;this.rel='stylesheet'" />
```
- **`rel="preload"`**: 브라우저가 리소스를 미리 다운로드
- **`as="style"`**: 리소스 타입 명시로 우선순위 결정
- **`onload="this.onload=null;this.rel='stylesheet'"`**: 로딩 완료 시 CSS로 적용

#### `<noscript>` 폴백의 필요성
```html
<!-- CSS 비동기 로딩을 위한 폴백 -->
<noscript><link rel="stylesheet" href="/public/builds/tailwind.css"></noscript>
```

**왜 필요한가?**
- **JavaScript 비활성화 환경**: 일부 사용자는 JavaScript를 비활성화할 수 있음
- **`onload` 이벤트 의존성**: 위의 preload 기법이 JavaScript `onload` 이벤트에 의존
- **접근성 보장**: JavaScript 없이도 CSS가 정상적으로 로드되도록 보장

**동작 방식:**
1. **JavaScript 활성화**: `preload` + `onload` 방식으로 비동기 로딩
2. **JavaScript 비활성화**: `<noscript>` 내부의 일반 `<link>` 태그로 동기 로딩

이는 **점진적 향상(Progressive Enhancement)** 원칙을 따르는 방법입니다.

#### JavaScript 지연 로딩
```html
<script src="/public/builds/app.js" defer></script>
```
- **`defer`**: HTML 파싱 완료 후 스크립트 실행
- **효과**: 페이지 렌더링 차단 방지

### 개선 효과
- **FCP (First Contentful Paint)**: 크게 개선
- **LCP (Largest Contentful Paint)**: 개선
- **렌더링 차단 시간**: 2.28초 → 거의 0초

---

## 3. 폰트 로딩 최적화

### 문제
폰트에 `font-display: swap` 설정이 누락되어 FOIT(Flash of Invisible Text) 발생

### 기존 코드
```css
/* resources/assets/stylesheets/font.css */
@font-face {
  font-family: "GothicA1";
  src: url("/public/fonts/GothicA1-Light.ttf");
  font-weight: 300;
  /* font-display 누락 */
}
```

### 개선된 코드
```css
/* resources/assets/stylesheets/font.css */
@font-face {
  font-display: swap;  /* 추가 */
  font-family: "GothicA1";
  src: url("/public/fonts/GothicA1-Light.ttf");
  font-weight: 300;
}
```

### font-display 옵션 설명
- **`swap`**: 폰트 로딩 중 fallback 폰트 표시, 로딩 완료 시 즉시 교체
- **효과**: 텍스트가 즉시 보이므로 사용자 경험 향상 + FOIT 방지

---

## 4. 압축 최적화

### 문제
정적 파일들이 압축되지 않아 전송 크기가 큼

### 개선된 코드
```typescript
// src/main.ts
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Gzip 압축 활성화
  app.use(compression());
  
  // ... 기타 설정
}
```

### 개선 효과
- **텍스트 기반 리소스**: 60-80% 크기 감소
- **네트워크 전송 시간**: 대폭 단축
- **모바일 환경**: 특히 큰 성능 향상

---

## 추가 고려사항 (현재 프로젝트에서 제외)

### JavaScript 코드 분할 (Code Splitting)
개발 경험을 고려하여 현재는 적용하지 않았지만, 추후 고려할 수 있는 최적화:

```javascript
// 조건부 컨트롤러 로딩 예시
const loadControllerIfNeeded = async (selector, controllerName, importFn) => {
  if (document.querySelector(selector)) {
    const { default: Controller } = await importFn();
    application.register(controllerName, Controller);
  }
};
```

---

## 결과

### 성능 점수 변화
- **Before**: 56점
- **After**: 99점
- **개선율**: +43점 (76% 향상)

### 주요 개선 지표
1. **캐시 효율성**: 4시간 → 1년 (정적 파일)
2. **렌더링 차단 제거**: 2.28초 지연 → 거의 0초
3. **폰트 로딩**: FOIT 방지로 사용자 경험 향상
4. **압축**: 60-80% 파일 크기 감소

### 사용자 경험 개선
- **초기 로딩**: 빠른 First Paint로 즉시 콘텐츠 표시
- **재방문**: 캐시된 리소스로 즉시 로딩
- **모바일**: 압축으로 데이터 사용량 감소

---

## 참고 자료

- [Lighthouse Performance Audits](https://developers.google.com/web/tools/lighthouse/audits/performance)
- [Critical Resource Hints](https://web.dev/preload-critical-assets/)
- [Font Display](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display)
- [HTTP Caching](https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/http-caching)
