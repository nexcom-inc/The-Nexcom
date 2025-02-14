import { AuthGuard } from '@nestjs/passport';
import {  ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { AUTH_SERVICE } from '@the-nexcom/nest-common';


@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {

  constructor(
    @Inject(AUTH_SERVICE) private readonly authService: ClientProxy
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const canBeActive = await super.canActivate(context) as boolean;
        await super.logIn(request);
        try {
          // Essaie d'appeler l'API de vérification de l'utilisateur
          await firstValueFrom(this.authService.send({ cmd: 'authenticate-user' }, request.user.id));
        } catch (error) {
          console.error('Authentication failed:', error);

      // Crée une réponse HTML pour l'utilisateur
      context.switchToHttp().getResponse().status(401).send(`
        <html>
          <body style="text-align: center; font-family: Arial;">
            <h1>Échec de l'authentification</h1>
            <p>Impossible de vous connecter.</p>
            <p>${error.message}</p>
            <a href="/">Retour à l'accueil</a>
          </body>
        </html>
      `);
          return false;
        }

        return canBeActive;
      }

      handleRequest<TUser = any>(err: any, user: any, info: any, context: ExecutionContext, status?: any): TUser {
        if (err || !user) {
          throw err || new UnauthorizedException("Vous n'êtes pas authentifié");
        }
        return user;
      }
}
