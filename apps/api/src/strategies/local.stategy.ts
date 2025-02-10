
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy
  ) {
    super(
      {
        usernameField: 'email',
      },
    );
  }

  async validate(username: string, password: string): Promise<unknown> {
    console.log("username", username);

    const user = await firstValueFrom(
      this.authService.send({ cmd: 'validate-email-password-user' }, { email: username, password }),
    )
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
