import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { catchError, of, switchMap } from "rxjs";

@Injectable()
export class AuthGuard  implements CanActivate {

  constructor(
    @Inject('AUTH_SERVICE') private readonly auth: ClientProxy
  ) {}

  canActivate(context : ExecutionContext) {
      if (context.getType() !== 'http') {
        return false;
      }

      const authHeader = context.switchToHttp().getRequest().headers['authorization'] as string;



      if (!authHeader) return false;

      const parts = authHeader.split(' ');

      if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1])  return false;

      const [_, jwt] = parts;

      console.log("verify token", jwt);


      return this.auth.send({cmd : 'verify-token'}, {jwt}).pipe(
        switchMap(({exp}) => {

          console.log("exp", exp);

          if (!exp) return of(false);

          const TOKEN_EXP_MS = exp * 1000;

          const isjwtValid = Date.now() < TOKEN_EXP_MS;

          return of(isjwtValid);

        }),
        catchError(() => {

          throw new UnauthorizedException();
        })
    )
  }
}
