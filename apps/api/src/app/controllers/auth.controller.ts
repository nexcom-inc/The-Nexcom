import { BadRequestException, Body, Controller, Get, HttpCode, Inject, Post, Query, Req, Res, UseGuards, UsePipes } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateUserDto, createUserSchema, LoginUserSchema } from '@the-nexcom/dto';
import {  ZodValidationPipe } from '@the-nexcom/nest-common';
import { GoogleAuthGuard, JwtRefreshGuard, LocalAuthGuard } from '../../guards';
import { firstValueFrom } from 'rxjs';
import { Response } from 'express';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { QueryRequired } from '../../decorators';


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
  @UsePipes(new ZodValidationPipe(LoginUserSchema))
  @ApiBody({
    type: 'object',
    schema: {
      title: 'Login',
      properties: {
        email: {
          type: 'string',
          format: 'email',
        },
        password: {
          type: 'string',
          format: 'password',
        },
      },
      required: ['email', 'password'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'login with email and password',
    schema: {
      type: 'object',
      properties: {
        accessToken: {
          type: 'string',
        },
        refreshToken: {
          type: 'string',
        },
      },
    },
  })
  @Post('/login')
  async login(
    @Req() req,
    @Res() res : Response,
  ) {
    await firstValueFrom(this.authService.send({ cmd: 'authenticate-user' }, req.user.id));

    const userId = req.user.id;
    const sessionId = req.session.id;


    const {sat, sct} = await firstValueFrom(this.authService.send({ cmd: 'update-session-token' }, {
      userId,
      sessionId
    }));

    res.cookie('_sat',sat, { httpOnly: true, expires: new Date(Date.now() + 60 * 60 * 1000), maxAge: 24 * 60 * 60 * 1000, sameSite:'strict' });
    res.cookie('_sct', sct, { httpOnly: true , expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), maxAge: 7 * 24 * 60 * 60 * 1000, sameSite:'strict' });

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
    const userId = req.user.id;
    const sessionId = req.session.id;


    const {sat, sct} = await firstValueFrom(this.authService.send({ cmd: 'update-session-token' }, {
      userId,
      sessionId
    }));

    res.cookie('_sat',sat, { httpOnly: true, expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), maxAge: 24 * 60 * 60 * 1000, sameSite:"strict" });
    res.cookie('_sct', sct, { httpOnly: true , expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), maxAge: 7 * 24 * 60 * 60 * 1000, sameSite:'strict' });



    res.redirect(`http://localhost:3001/auth/login?redirect=true&serviceName=Accounts`);
  }

  @Get('/verify-email')
  verifyEmail(
    @QueryRequired('code') code : string
  ){


    if (!code) {
      return new BadRequestException('code is required')
    }
    return this.authService.send({ cmd: 'verify-email' }, code);
  }
}
