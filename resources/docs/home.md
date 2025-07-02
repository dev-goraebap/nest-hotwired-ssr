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
A. 구성이 아예 불가능한것은 아닙니다. Vite는 ESM을 기본으로 사용하는 반면, NestJS는 CommonJS 환경을 기본으로 합니다. NestJS 팀은 ESM 지원에 대해 [회의적인 입장](https://github.com/nestjs/nest/issues/13319#issuecomment-2022145229)을 말했으며(듣고보니 타당함..), Vite를 NestJS에 직접 통합하려면 복잡한 보일러플레이트 코드가 필요합니다. 이번 프로젝트의 방향성은 Nestjs의 기본적인 구조는 손대지 않고 추가로 확장하는데 초점을 두었습니다.

```
npm run setup
```
### 프로젝트 실행

concurrent 라이브러리를 통해 프론트엔드 에셋파일(javascript,typescript,css 등)을 감시하는 프로세스와 nestjs 서버 프로세스가 동시에 실행됩니다.

```
npm run start:dev:all
```

## TMI

### 많은 Template Engine 중에 Edge.js를 선택한 이유

- [pug](https://pugjs.org/api/getting-started.html): 4~5년 전에 써본적이 있었습니다. 당시엔 상당히 좋아했는데, 요즘은 tailwindcss 등의 UI관련사이트에서 html 조각을 복사해서 가져오는데, pug 문법으로 바꾸는게 오히려 더 번거롭다고 느꼈습니다.
- [nunjucks](https://mozilla.github.io/nunjucks/): 모질라제단에서 만들었고, 이번에 처음 알았습니다. 상당히 완성도가 높으며 레이아웃 상속, 파셜, 변수등 깔끔하게 지원하지만 edge.js의 맛을 알고있는 저에겐 오히려 2% 부족한 느낌입니다.
- [ejs](https://ejs.co/): nodejs측 SSR을 혐오하게 만드는 주범입니다. 그냥 탈락입니다.
- [handlebars](https://handlebarsjs.com/) 문법이 나쁘지 않은데, 레이아웃이나 파셜 사용이 정말 아쉽습니다. nunjucks가 상위호환이라고 생각합니다.

[Edge.js](https://edgejs.dev/docs/introduction)는 adonisjs측에서 만든 템플릿엔진입니다. 이녀석을 nestjs에서 깔끔하게 사용할 수 있으면 정말 좋았겠지만 esm에서 작동하는 친구라 살짝 작업이 필요한것 말곤 괜찮은 편입니다. (주관적인 생각입니다)

### Assets Pipeline 구성 이슈

- 원래 vite까지 사용할 의도는 없었고 esbuild를 통해 더 간단하게 구성하려고 했습니다.
즉, resources 디렉토리에서 vite 없이 esbuild만으로 tailwindcss, js 파일등의 빌드 자동화가 가능합니다. 그런데, template engine이 문제인지(이 때 당시 구성은 nunjucks로 테스트 중이였음) html 파일에서 변경이 일어나면 서버는 재시작이 되는데 tailwindcss가 해당 구성을 잡질 못하는 문제가 생김 

  ex) text-2xl 같은 클래스를 태그에 추가했는데 새로고침해도 변경되지 않음

  - [초기 에셋파이프라인 구성 커밋](https://github.com/dev-goraebap/nestjs-mvc-is-coming/commit/89ca81046dd0fcf8ce7a5e7c7047223265a627b0) 해당 내역에서 확인 가능.

- vite를 사용하고 있지만 vite dev는 사용하지 않음. HMR 역시 사용하지 않습니다. build --watch 옵션을 사용. 지금은 귀찮아서 나중에 필요하면 개선할 예정

### 프론트엔드측 소스코드도 typescript 사용하면 안되나요?

구성이 어려운건 아닙니다만, 현재 프로젝트 구조정도에선 과한 투자라고 생각합니다.

프론트엔드 소스코드의 주력을 담당할 `hotwired/stimulus`도 기본적으로 [타입스크립트사용](https://stimulus.hotwired.dev/reference/using-typescript) 이 용의하게 구성되어있기 때문에, vite 설정만 ts파일로 바꿔주면 됩니다.