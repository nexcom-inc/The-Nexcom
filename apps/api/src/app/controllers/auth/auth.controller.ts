import { Body, Controller, Get, Inject, Post, Req, Res, UseGuards, UsePipes } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateUserDto, createUserSchema, LoginUserDto, LoginUserSchema } from '@the-nexcom/dto';
import { ZodValidationPipe } from '@the-nexcom/nest-common';
import { GoogleAuthGuard } from '../../../guards';
import { firstValueFrom } from 'rxjs';

@Controller('auth')
export class AuthController {
  constructor(
   @Inject('AUTH_SERVICE') private readonly authService: ClientProxy
  ) {}


  @Post('/register')
  @UsePipes(new ZodValidationPipe(createUserSchema))
  async register(@Body() user: CreateUserDto) {
    return this.authService.send({ cmd: 'register-email-password' }, { user });
  }

  @Post('/login')
  @UsePipes(new ZodValidationPipe(LoginUserSchema))
  async login(@Body() user: LoginUserDto) {
    return this.authService.send({ cmd: 'login-email-password' }, { user });
  }

  @UseGuards(GoogleAuthGuard)
  @Get('/google/login')
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  googleLogin() {}


  @UseGuards(GoogleAuthGuard)
  @Get('/google/callback')
  async googleLoginCallback(
    @Req() req,
    @Res() res
  ) {
    console.log("Google login callback");
    const response = await firstValueFrom(this.authService.send({ cmd: 'oauth-login' }, req.user.id));

    console.log("response", response);

    res.redirect(`http://localhost:3001/auth/login?accessToken=${response.access_token}&refreshToken=${response.access_token}`);
  }
}
