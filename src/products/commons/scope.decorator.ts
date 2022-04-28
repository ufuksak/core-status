import {RequestWithOptionalTokenData} from "@globalid/nest-auth"
import {createParamDecorator, ExecutionContext, ForbiddenException} from "@nestjs/common"
import {Request} from 'express';


export const ScopedTokenDataParam = createParamDecorator((scopes: string[], ctx: ExecutionContext) => {
  const request: Request = ctx.switchToHttp().getRequest()
  const { tokenData } = <RequestWithOptionalTokenData>request

  if(scopes) {
    const intersection = tokenData.scopes.filter(value => scopes.includes(value));
    if(intersection.length !== scopes.length) {
      throw new ForbiddenException('scopes violation');
    }
  }

  return tokenData
})