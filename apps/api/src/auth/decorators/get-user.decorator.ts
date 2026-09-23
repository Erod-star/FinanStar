import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { UserDocument } from '../entities/user.entity';

export const GetUser = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<{ user?: UserDocument }>();
  const user = request.user;

  if (!user) {
    throw new InternalServerErrorException('User not found in request.');
  }

  return user;
});
