import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, Observable, of, switchMap } from 'rxjs';

@Injectable()
export class SessionGuard implements CanActivate {

  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    if (!request.user) return false;



    const {_sat, _sct} = request.cookies;
    const sessionId = request.session.id;
    const userId = request.user.id;

    if (!_sat || !_sct || !sessionId) return false;
    return this.authService.send({ cmd: 'validate-session-tokens' }, {
      userId,
      sessionId,
      sat: _sat,
      sct: _sct
    }).pipe(
      switchMap(({err, sat}) => {




        if (err) {
          throw new UnauthorizedException();
        }

        if (sat) {

          request.cookies('_sat', sat, { httpOnly: true, expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), maxAge: 24 * 60 * 60 * 1000, sameSite:'none' });
        }

        return of(true);
      }),
      catchError((e) => {

        throw new UnauthorizedException();
      })
    )
  }
}
