import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
// import { JwtService } from "@nestjs/jwt";
import { ClientProxy } from "@nestjs/microservices";
import { catchError, of, switchMap } from "rxjs";

@Injectable()
export class JwtAuthGuard  implements CanActivate {

  constructor(
    //  this might be a bad idea (this comment is no longer valid because JwtModule is used and configured in AuthModule)
    @Inject('AUTH_SERVICE') private readonly auth: ClientProxy,
    // ! do not use this here because it's module is not configured in Appmodule
    // private readonly jwtService: JwtService,
  ) {}

  canActivate(context : ExecutionContext) {
      if (context.getType() !== 'http') {
        return false;
      }

      const authHeader = context.switchToHttp().getRequest().headers['authorization'] as string;



      if (!authHeader) return false;

      const parts = authHeader.split(' ');

      if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1])  return false;

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_, jwt] = parts;


      //  this might be a bad idea (this comment is no longer valid because JwtModule is used and configured in AuthModule)
      return this.auth.send({cmd : 'verify-token'}, {jwt}).pipe(
        switchMap(({exp}) => {


          if (!exp) return of(false);

          const TOKEN_EXP_MS = exp * 1000;

          const isjwtValid = Date.now() < TOKEN_EXP_MS;

          return of(isjwtValid);

        }),
        catchError(() => {

          throw new UnauthorizedException();
        })
    )

    // ! do not use this here because jwtService's module is not configured in Appmodule
    // try {
    //   // Vérification asynchrone du token
    //   const payload = await this.jwtService.verifyAsync(jwt);

    //   // (Optionnel) Vérification manuelle de l'expiration si besoin
    //   if (!payload || !payload.exp) {
    //     return false;
    //   }
    //   const tokenExpirationMs = payload.exp * 1000;
    //   if (Date.now() >= tokenExpirationMs) {
    //     return false;
    //   }

    //   // Si tout est OK, on autorise l'accès
    //   return true;
    // // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // } catch (error) {
    //   // En cas d'erreur (token invalide, expiré, etc.), on rejette la requête
    //   throw new UnauthorizedException();
    // }
  }
}
