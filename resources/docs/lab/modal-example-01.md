# 모달 1편: 조금 불편한 예제

1. 해당 페이지 컨텐츠를 감싸는 [예제용 modal-01 컨트롤러](https://github.com/dev-goraebap/nestjs-mvc-is-coming/blob/feat/modal-example-01/resources/views/pages/lab/modal-example-01/index.edge#L4) 연결
2. 모달 UI는 미리 마크업해둔 [(hidden) 클래스를 통해 숨겨놓기](https://github.com/dev-goraebap/nestjs-mvc-is-coming/blob/feat/modal-example-01/resources/views/pages/lab/modal-example-01/index.edge#L33)
3. 버튼을 클릭하면 modal-01 컨트롤러의  [onOpen 액션 호출](https://github.com/dev-goraebap/nestjs-mvc-is-coming/blob/feat/modal-example-01/resources/javascripts/controllers/lab/modal-example-01/modal.controller.js#L10)
4. 모달 UI의 hidden 클래스를 지워서 모달 노출
5. 설정한 url value로 api 호출 → 받아온 데이터를 innerHTML로 랜더링
6. 닫기버튼 클릭시 모달의 스타일을 통해 안보이게 처리

---

모달의 UI는 html에 정의 하였지만 api를 통해 가져온 데이터를 화면에 보이는 과정에서  
innerHTML이나 document.createElement 를 사용할 수 밖에 없음.  
당연히 프론트엔드측 프레임워크나 라이브러리를 사용하는 것보다 개발 경험이 떨어짐.  
stimulus는 html↔js 사이의 이벤트계층을 추상화 해줄 뿐 그 이상 그 이하도 아니기 때문에  
js에서 돔을 생성하는 일은 최대한 피해야함.