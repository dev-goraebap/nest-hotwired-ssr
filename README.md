# NestJS MVC: 현대적인 풀스택 개발 환경 구축하기

"A progressive Node.js framework for building efficient, reliable and scalable server-side applications."

이는 NestJS 공식 문서에서 언급하는 슬로건입니다. NestJS는 효율적이고 신뢰할 수 있으며 확장 가능한 서버 사이드 애플리케이션을 구축하기 위한 프레임워크를 지향합니다. API와 SSR 모두 지원하지만, 주로 API 서버로 사용되며 서버 사이드 렌더링 기능은 Laravel, Ruby on Rails, Django와 같은 현대 풀스택 프레임워크에 비해 상대적으로 부족한 편입니다. 이 프로젝트가 존재하는 이유이기도 합니다.

## 풀스택 개발의 두 가지 접근법

### 프론트엔드 진영의 접근법

프론트엔드 프레임워크들은 SSR을 위해 '하이드레이션'이라는 방법을 발전시켜 왔습니다. 서버에서 렌더링된 HTML에 클라이언트 측 JavaScript를 주입하여 동적 기능을 활성화하는 방식입니다.

### 전통적 풀스택 프레임워크의 접근법

반면, 전통적인 풀스택 프레임워크를 사용하는 진영에서는 SSR이 기본이기 때문에 CSR이 제공하는 사용자 경험을 어떻게 구현할지 고민해왔습니다. 대표적인 사례로:

- [InertiaJS](https://inertiajs.com/) (Laravel 진영): React, Vue, Svelte 등의 라이브러리를 서버 측 프레임워크와 통합할 수 있게 해줍니다. 하지만 기본적으로 클라이언트 렌더링에 중점을 두며, SSR을 위해서는 추가 구성이 필요합니다. 공식문서의 SSR 파트를 따라가는데 개인적으로 완성도가 떨어진다는 느낌을 받았습니다(결국 원하는 구현에 실패했기 때문)

- [Hotwired](https://hotwired.dev/) (Ruby on Rails 진영): Turbo를 통해 추가 코드 없이 페이지 전환을 CSR처럼 구현합니다. SSR 개발 방식을 유지하면서도 DOM 조작이 필요한 경우에 HTML 중심의 사고방식으로 접근할 수 있어 개발 경험이 나쁘지 않았습니다.

## NestJS에서의 MVC 구현 여정

이전에 NestJS에 현대적인 프론트엔드 개발 환경을 통합하려 했으나 실패했습니다. 그러나 최근 몇 달간 AdonisJS와 Ruby on Rails를 경험하면서 서버 측 프레임워크에서 현대적 프론트엔드를 개발하는 방법(적합한 템플릿 엔진, 에셋 파이프라인 등)에 대한 인사이트를 얻었고, 이를 바탕으로 제가 가장 선호하는 프레임워크인 NestJS에 MVC 환경을 구축하고자 합니다.

## 실용적인 접근의 필요성

단순한 투두리스트 하나를 개발하는 데도 프론트엔드와 백엔드를 분리하는 현대적 개발 방식에는 여러 비효율이 존재합니다. 대규모 시스템에 대한 경험이 부족해서 나오는 생각일 수도 있지만, 반대로 생각해보면 모든 프로젝트가 대규모 프로젝트인 것은 아닙니다. 시간 및 관리 비용을 냉정하게 고려했을 때, 풀스택 접근법이 더 효율적인 경우도 분명 있다고 생각합니다.

NestJS 프레임워크를 선호하고 비슷한 고민을 해본 분들이라면, 이 프로젝트에서 유용한 영감을 얻어간다면 좋겠습니다.

## 프로젝트 설치

### 프로젝트 클론

프로젝트를 설치하려는 경로에 다음 명령어 입력

```
git clone https://github.com/dev-goraebap/nestjs-mvc-is-coming.git
```
### 필요한 의존성 설치

해당 프로젝트는 간단한 `Assets Pipeline`을 구성하기 위해 resources 디렉토리 하위에 vite를 통한 프론트엔드 자산관리가 추가로 들어갑니다. 아래 만들어진 스크립트를 통해 모든 의존성을 받아주세요.

<sub>Assets pipeline: 효율적이고 자동화된 자원 처리 및 배포 과정</sub><br/>
<sub>현대 프론트엔드 개발은 tailwindcss, typescript 등 여러 라이브러리를 조합하고 빌드 과정을 거쳐야 하는데, Assets pipeline은 이러한 프로세스를 체계화하여 개발 효율성을 높이고 최적화된 결과물을 생성합니다.</sub>

Q. 같은 nodejs 환경인데 프론트엔드설정을 nestjs에 바로 통합할 수 없나요? <br/>
A. 구성이 아예 불가능한것은 아닙니다. Vite는 ESM을 기본으로 사용하는 반면, NestJS는 CommonJS 환경을 기본으로 합니다. NestJS 팀은 ESM 지원에 대해 [회의적인 입장](https://github.com/nestjs/nest/issues/13319#issuecomment-2022145229)을 말했으며(듣고보니 타당함..), Vite를 NestJS에 직접 통합하려면 복잡한 보일러플레이트 코드가 필요합니다. 이전에 NestJS에 React 개발 환경을 통합하려다 실패하였습니다.(어떻게든 돌아는 가는데, 다른 라이브러리들이  박살남)
```
npm run setup
```
### 프로젝트 실행

concurrent 라이브러리를 통해 프론트엔드 에셋파일(javascript,typescript,css 등)을 감시하는 프로세스와 nestjs 서버 프로세스가 동시에 실행됩니다.

```
npm run start:dev:all
```