import { AuthGuard } from '@nestjs/passport';
import {  ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { AUTH_SERVICE } from '@the-nexcom/nest-common';
import { AuthService } from '../../app/services/auth.service';


@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {

  constructor(
      private readonly authService: AuthService
  ) {
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
