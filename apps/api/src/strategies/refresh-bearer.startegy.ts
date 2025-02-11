import { Inject } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from 'passport-jwt';
import { firstValueFrom } from "rxjs";

export class RefreshJwtBearerStrategy extends PassportStrategy(Strategy, 'refresh-jwt-bearer')  {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_REFRESH_SECRET,
      ignoreExpiration: false,
      passReqToCallback: true
    })
  }

  async validate (req, payload : any) {
    const refreshToken = req.get('authorization')?.replace('Bearer', '')?.trim();
    const userId = payload.userId;



    const user = await firstValueFrom(this.authService.send({ cmd: 'verify-refresh-token' }, { userId, refreshToken }))



    return {
      id: user.id
    }
  }

}
