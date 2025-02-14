import { BadRequestException, CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthService } from '../../app/services/auth.service';
import { Response } from 'express';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response : Response = context.switchToHttp().getResponse(); // Needed for setting new cookies

    if (!request.user) return false;

    const { _sat, _sct } = request.cookies;
    const sessionId = request.session?.id;
    const userId = request.user.id;

    if (!_sct || !sessionId) return false;

    try {
      const { err, newSat } = await this.authService.validateSessionTokens(userId, sessionId, _sat, _sct);

      if (err) {
        // request.session.destroy();
        throw new BadRequestException();
      }

      // If newSat is provided, update the session token in the response cookies
      if (newSat) {
        response.cookie('_sat', newSat, { httpOnly: true, secure: true });
      }

      return true;
    } catch (error) {
      request.session.destroy();
      throw new BadRequestException();
    }
  }
}
