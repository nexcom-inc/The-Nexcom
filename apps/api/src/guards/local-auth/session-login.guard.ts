import {  ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AuthGuard } from '@nestjs/passport';
import { AUTH_SERVICE } from '@the-nexcom/nest-common';

@Injectable()
export class SessionLoginGuard extends AuthGuard('local') {

    constructor(
      @Inject(AUTH_SERVICE) private readonly authService: ClientProxy
    ){
      super();
    }
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();

      const canBeActive = await super.canActivate(context) as boolean;
      await super.logIn(request);



      return canBeActive;
    }

    handleRequest<TUser = any>(err: any, user: any, info: any, context: ExecutionContext, status?: any): TUser {
      if (err || !user) {
        throw err || new UnauthorizedException("Vous n'êtes pas authentifié");
      }
      return user;
    }
}
