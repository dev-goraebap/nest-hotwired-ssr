# Nestjs + Hotwired

## 개요

이 프로젝트는 NestJS와 Hotwired(Turbo + Stimulus)를 결합하여 서버 사이드 렌더링(SSR)으로 클라이언트 사이드 렌더링(CSR)과 유사한 사용자 경험을 제공하는 방법을 보여줍니다. Ruby on Rails의 Hotwired와 같은 편의성을 완전히 구현하지는 못하지만, NestJS에서도 충분히 활용 가능한 접근 방식을 제시합니다.

## 기술 스택

- **백엔드**: NestJS
- **프론트엔드**: Hotwired(Turbo + Stimulus)
- **렌더링**: 서버 사이드 렌더링(SSR)
- **스타일**: TailwindCSS

## Hotwired란?

Hotwired는 최신 웹 애플리케이션을 구축하기 위한 접근 방식으로, 전통적인 MPA(Multi-Page Application)의 단순성과 SPA(Single-Page Application)의 사용자 경험을 결합합니다. 다음 구성 요소로 이루어져 있습니다:

- **Turbo**: 페이지 전환, 부분 업데이트, 실시간 업데이트를 처리
- **Stimulus**: HTML에 직접 연결되는 최소한의 JavaScript 프레임워크

## 왜 NestJS + Hotwired인가?

1. **프론트엔드 프레임워크 없이 상호작용하는 UI**:
   - 별도의 React, Vue, Angular 없이도 동적 UI 구현
   - 서버 중심 개발로 복잡성 감소

2. **성능 향상(기존의 MSP 개발방식에 비해)**:
   - 전체 페이지 새로고침 없는 빠른 페이지 전환
   - 필요한 HTML 부분만 업데이트하여 네트워크 사용량 감소

3. **개발 생산성**:
   - 현대 개발방식은 웹사이트 하나를 만들기 위해 프론트엔드와 백엔드 프로젝트를 나눠서 개발하는 경향이 있음. 인원이 있다면 분업이 가능하지만, 혼자서 개발하는 프로젝트에서는 개발하는 단계에 피로도가 높음. 개발 이후 유지보수 단계 역시 관리비용이 늘어남. 개인적으로 혼자서 진행하는 프로젝트에 적합한 방법론이라고 생각 

## 주요 기능

- Turbo Drive: 링크 클릭 시 전체 페이지 새로고침 없는 탐색
- Turbo Frames: 페이지의 특정 부분만 독립적으로 업데이트
- Turbo Streams: 서버에서 실시간으로 DOM 변경 스트리밍
- Stimulus Controllers: HTML 요소에 연결된 동작 정의

## 설치 및 설정

### 필수 요구 사항

- Node.js (v14 이상)
- npm 또는 yarn

### 프로젝트 설정

```bash
# 저장소 복제
git clone https://github.com/yourusername/nest-hotwired-ssr.git
cd nest-hotwired-ssr

# 의존성 설치
npm install

# 개발 서버 실행
npm run start:dev
```

## 프로젝트 구조

```
nest-hotwired-ssr/
├── src/
│   ├── controllers/       # NestJS 컨트롤러
│   ├── services/          # 비즈니스 로직
│   ├── views/             # 템플릿 파일
│   │   └── layouts/       # 레이아웃 템플릿
│   ├── public/            # 정적 자산
│   │   ├── js/
│   │   │   ├── turbo/     # Turbo 관련 코드
│   │   │   └── controllers/ # Stimulus 컨트롤러
│   │   └── css/
│   └── main.ts            # 애플리케이션 진입점
└── package.json
```

## 사용 방법

### Turbo Frames 예제

```html
<!-- 부분적으로 업데이트되는 영역 정의 -->
<turbo-frame id="user-list">
  <h2>사용자 목록</h2>
  <ul>
    <% users.forEach(user => { %>
      <li><%= user.name %></li>
    <% }) %>
  </ul>
  
  <a href="/users/new" data-turbo-frame="user-list">
    새 사용자 추가
  </a>
</turbo-frame>
```

### Stimulus 컨트롤러 예제

```typescript
// public/js/controllers/hello_controller.js
import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["name", "output"]
  
  greet() {
    this.outputTarget.textContent = `안녕하세요, ${this.nameTarget.value}!`
  }
}
```

```html
<!-- 뷰에서 사용 -->
<div data-controller="hello">
  <input data-hello-target="name" type="text">
  <button data-action="click->hello#greet">인사하기</button>
  <span data-hello-target="output"></span>
</div>
```

## Rails와의 차이점

NestJS에서 Hotwired를 사용할 때 Rails와 비교하여 몇 가지 차이점이 있습니다:

1. **통합 수준**: Rails는 Hotwired와 깊이 통합되어 있는 반면, NestJS는 수동 설정 필요
2. **헬퍼 메서드**: Rails의 편리한 뷰 헬퍼가 없으므로 직접 구현 필요
3. **실시간 기능**: ActionCable 대신 Socket.io를 사용하여 Turbo Streams 구현 (이 프로젝트에서는 구성 X)

## 참고 자료

- [Hotwired 공식 문서](https://hotwired.dev/)
- [Turbo 핸드북](https://turbo.hotwired.dev/handbook/introduction)
- [Stimulus 핸드북](https://stimulus.hotwired.dev/handbook/introduction)
- [NestJS 공식 문서](https://nestjs.com/)
