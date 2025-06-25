import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * 컨트롤러 메서드의 파라미터에 @View() 형식으로 사용
 * 렌더링 서비스 인스턴스에 접근 가능
 */
export const View = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request['view'];
  },
);
