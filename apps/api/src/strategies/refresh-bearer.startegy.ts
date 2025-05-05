import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from 'passport-jwt';
import { AuthService } from "../app/services/auth.service";

export class RefreshJwtBearerStrategy extends PassportStrategy(Strategy, 'refresh-jwt-bearer')  {
  constructor(
    private readonly authService: AuthService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_REFRESH_SECRET,
      ignoreExpiration: false,
      passReqToCallback: true
    })
  }

  async validate (req, payload : {userId:string}) {
    const refreshToken = req.get('authorization')?.replace('Bearer', '')?.trim();
    const userId = payload.userId;



    const user = await  this.authService.verifyRefreshToken(userId, refreshToken);



    return {
      id: user.id
    }
  }

}
