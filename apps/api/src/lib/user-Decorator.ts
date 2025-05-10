

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserPayload } from 'src/types/express';

export const User = createParamDecorator(
    (data:keyof UserPayload | undefined, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const user = request.user;
        if (data) {
            return data=user?.[data];
        }
        return user;
    }
)