import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { UserContext } from "@restovyn/types";

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserContext => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
