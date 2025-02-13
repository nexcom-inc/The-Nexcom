import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy} from '@nestjs/passport'
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigType } from '@nestjs/config';
import googleOauthConfig from '../app/config/google/google-oauth.config';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { OauthUserDto } from '@the-nexcom/dto';



@Injectable()
export class  GoogleStrategy extends PassportStrategy(Strategy){

  constructor(
    @Inject(googleOauthConfig.KEY)
    private googleOauthConfiguration: ConfigType<typeof googleOauthConfig>,
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy
  )
  {
    super({
      clientID: googleOauthConfiguration.clientId ?? '',
      clientSecret: googleOauthConfiguration.clientSecret ?? '',
      callbackURL: googleOauthConfiguration.callbackUrl,
      scope: ['email', 'profile']
    })
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback) {





      const googleUser : OauthUserDto = {
        email : profile.emails[0].value,
        firstName : profile.name.givenName,
        emailVerified : profile.emails[0].verified,
        lastName : profile.name.familyName,
        fullName : profile.displayName,
        accountProviderId : profile.id,
        provider : 'GOOGLE'
      }
      const user = await firstValueFrom(
        this.authService.send({ cmd: 'validate-aouth-user' }, googleUser)
      )


      done(null, user);
  }
}
