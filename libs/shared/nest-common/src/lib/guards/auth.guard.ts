import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
// import { ClientProxy } from "@nestjs/microservices";
// import { catchError, of, switchMap } from "rxjs";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthGuard  implements CanActivate {

  constructor(
    // ! i'll do the verification right here
    // @Inject(AUTH_SERVICE) private readonly auth: ClientProxy
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context : ExecutionContext) {
      if (context.getType() !== 'http') {
        return false;
      }

      const authHeader = context.switchToHttp().getRequest().headers['authorization'] as string;



      if (!authHeader) return false;

      const parts = authHeader.split(' ');

      if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1])  return false;

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_, jwt] = parts;


      // ! this might be a bad idea
      // ! i'll do the verification in this guard
    //   return this.auth.send({cmd : 'verify-token'}, {jwt}).pipe(
    //     switchMap(({exp}) => {


    //       if (!exp) return of(false);

    //       const TOKEN_EXP_MS = exp * 1000;

    //       const isjwtValid = Date.now() < TOKEN_EXP_MS;

    //       return of(isjwtValid);

    //     }),
    //     catchError(() => {

    //       throw new UnauthorizedException();
    //     })
    // )

    // * doing the verification right here
    try {
      // Vérification asynchrone du token
      const payload = await this.jwtService.verifyAsync(jwt);

      // (Optionnel) Vérification manuelle de l'expiration si besoin
      if (!payload || !payload.exp) {
        return false;
      }
      const tokenExpirationMs = payload.exp * 1000;
      if (Date.now() >= tokenExpirationMs) {
        return false;
      }

      // Si tout est OK, on autorise l'accès
      return true;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // En cas d'erreur (token invalide, expiré, etc.), on rejette la requête
      throw new UnauthorizedException({
        message: 'Unauthorized',
        status: 401
      });
    }
  }
}
