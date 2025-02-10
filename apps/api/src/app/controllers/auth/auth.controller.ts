import { Body, Controller, Get, HttpCode, Inject, Post, Req, Res, UseGuards, UsePipes } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateUserDto, createUserSchema, LoginUserSchema } from '@the-nexcom/dto';
import {  ZodValidationPipe } from '@the-nexcom/nest-common';
import { GoogleAuthGuard, LocalAuthGuard } from '../../../guards';
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
    @Res() res : Response
  ) {
    const response = await firstValueFrom(this.authService.send({ cmd: 'authenticate-user' }, req.user.id));

    res.cookie('at', response.access_token, { httpOnly: true });
    res.cookie('rt', response.refresh_token, { httpOnly: true });

    res.send({
      message : "authenticated",
      uid : req.user.id
    })

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
    const response = await firstValueFrom(this.authService.send({ cmd: 'authenticate-user' }, req.user.id));

    console.log("response", response);

    res.redirect(`http://localhost:3001/auth/login?accessToken=${response.access_token}&refreshToken=${response.access_token}`);
  }
}
