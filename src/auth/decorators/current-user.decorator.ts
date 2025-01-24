import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Custom decorator
export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user ?? null;
  },
);
