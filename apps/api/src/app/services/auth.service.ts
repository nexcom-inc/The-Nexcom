import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { CreateUserDto } from "@the-nexcom/dto";
import { firstValueFrom } from "rxjs";

/**
 * Auth service : this service is used to communicate with the auth microservice
 */
@Injectable()
export class AuthService {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy
  ) {}

  registerEmailAndPassword(user : CreateUserDto) {
    return this.authService.send({ cmd: 'register-email-password' }, { user });
  }

  async getSessionTokens(userId : string, sessionId : string) {
    await firstValueFrom(this.authService.send({ cmd: 'authenticate-user' }, userId));

    return await firstValueFrom(this.authService.send({ cmd: 'update-session-token' }, {
      userId,
      sessionId
    }));
  }

  verifyEmail(code : string) {
    return this.authService.send({ cmd: 'verify-email' }, code);
  }

  async refreshToken(userId : string) {
    return await firstValueFrom(this.authService.send({ cmd: 'refresh-token' }, userId));
  }
  async validateSessionTokens(userId,sessionId,sat,sct) {

    console.log("validateSessionTokens",userId,sessionId,sat,sct);


    try {
      const {err, newSat} = await  firstValueFrom(this.authService.send({ cmd: 'validate-session-tokens' }, {
        userId,
        sessionId,
        sat,
        sct
      }));

      return {
        err: err,
        newSat
      }
    } catch (err) {
      return {
        err: err,
        sat: null
      }
    }
  }

  async getJwtTokens(userId : string) {
    console.log("getJwtTokens user Id in service",userId);

    return await firstValueFrom(this.authService.send({ cmd: 'get-jwt-tokens' }, userId));
  }
}
