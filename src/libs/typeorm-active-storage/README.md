## TypeORM Active Storage Module

이 모듈은 Ruby on Rails의 Active Storage에서 영감을 받아, NestJS와 TypeORM 환경에서 파일 첨부 및 관리 기능을 손쉽게 구현할 수 있도록 설계되었습니다.

Active Storage의 직관적이고 강력한 파일 관리 방식이 마음에 들어, NestJS 스타일로 재해석하여 개발하였습니다.  
이 모듈을 통해 데이터베이스 기반의 파일 메타데이터 관리, 다양한 스토리지 어댑터(Local, S3 등) 확장, 첨부파일의 업로드/조회/삭제/가비지 컬렉션 등 실무에 필요한 파일 관리 기능을 일관된 방식으로 사용할 수 있습니다.

### 의존성

본 모듈을 사용하려면 아래 라이브러리와 타입을 설치해야 합니다.

```
npm install typeorm @nestjs/typeorm sqlite3
npm install --save-dev @types/express @types/multer
```

여러 시행착오 끝에, 본 모듈은 TypeORM에 자연스럽게 의존하는 구조로 설계되었습니다.
초기에는 "파일 관리 모듈은 데이터베이스에 의존적이면 안 된다"는 생각으로,
메모리 기반 테스트 환경을 지원하고자 서비스 레이어, 모델, 어댑터, 리포지토리 모두를 인터페이스 기반으로 구현해 자유도를 높이려 했습니다. -> [이전 방식의 소스코드 링크](https://github.com/dev-goraebap/nestjs-mvc-is-coming/tree/feat/active-storage/src/shared/active-storage)<br/>
하지만 실제로는 설계 자체가 TypeORM을 염두에 두고 작성되어,
의존성을 분리하더라도 TypeORM이 아닌 환경에서는 사용성이 크게 떨어진다는 결론에 이르렀습니다.
따라서 이 모듈은 TypeORM 사용을 기본 전제로 합니다.

향후에는 TypeORM Entity 클래스에서 Attach 엔티티와 쉽게 관계를 맺을 수 있는
헬퍼 데코레이터 등도 제공할 예정입니다.

추가로, StoragePort를 구현하는 StorageAdapter(S3, GCP 등)도
차후 지원할 계획입니다.
