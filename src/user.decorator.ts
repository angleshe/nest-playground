import { createParamDecorator } from '@nestjs/common';

export const User = createParamDecorator<[string] | []>((key, ctx) => {
  const req = ctx.switchToHttp().getRequest();
  return key ? req.user?.[key] : req.user;
});
