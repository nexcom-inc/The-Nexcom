import { Body, Controller, Get, HttpCode, Inject, Post, Req, Res, Session, UseGuards, UsePipes } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateUserDto, createUserSchema, LoginUserSchema } from '@the-nexcom/dto';
import {  ZodValidationPipe } from '@the-nexcom/nest-common';
import { GoogleAuthGuard, JwtRefreshGuard, LocalAuthGuard } from '../../../guards';
import { firstValueFrom } from 'rxjs';
import { Response } from 'express';


@Controller('auth')
export class AuthController {
  constructor(
   @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
   @Inject('USER_SERVICE') private readonly userService: ClientProxy
  ) {}


  @Post('/register')
  @UsePipes(new ZodValidationPipe(createUserSchema))
  async register(@Body() user: CreateUserDto) {
    return this.authService.send({ cmd: 'register-email-password' }, { user });
  }

  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  @UsePipes(new ZodValidationPipe(LoginUserSchema))
  async login(
    @Req() req,
    @Res() res : Response,
  ) {
    const response = await firstValueFrom(this.authService.send({ cmd: 'authenticate-user' }, req.user.id));




    const {sat, sct} = await firstValueFrom(this.authService.send({ cmd: 'update-session-token' }, {
      userId: req.user.id,
      sessionId: req.session.id
    }));

    res.cookie('_sat', sat, { httpOnly: true, expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), maxAge: 24 * 60 * 60 * 1000, sameSite:'none' });
    res.cookie('_sct', sct, { httpOnly: true , expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), maxAge: 7 * 24 * 60 * 60 * 1000, sameSite:'none' });

    res.send({
      message : "authenticated",
    })

  }

  @UseGuards(JwtRefreshGuard)
  @Post('/refresh')
  refreshToken(@Req() req) {
    return firstValueFrom(this.authService.send({ cmd: 'authenticate-user' }, req.user.id));
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
    const response = await firstValueFrom(this.authService.send({ cmd: 'authenticate-user' }, req.user.id));


    res.redirect(`http://localhost:3001/auth/login?accessToken=${response.access_token}&refreshToken=${response.access_token}`);
  }
}
