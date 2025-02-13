import { BadRequestException, Body, Controller, Get, HttpCode, Inject, Post, Req, Res, UseGuards, UsePipes } from '@nestjs/common';
import { CreateUserDto, createUserSchema, LoginUserSchema } from '@the-nexcom/dto';
import {  ZodValidationPipe } from '@the-nexcom/nest-common';
import { GoogleAuthGuard, JwtAuthGuard, JwtRefreshGuard, LocalAuthGuard } from '../../guards';
import {  Response } from 'express';
import { QueryRequired } from '../../decorators';
import { AuthService } from '../services/auth.service';
import { AuthGuard } from '@nestjs/passport';


@Controller('auth')
export class AuthController {
  constructor(
  private readonly authService: AuthService,
  ) {}


  @Post('/register')
  @UsePipes(new ZodValidationPipe(createUserSchema))
  async register(@Body() user: CreateUserDto) {
    return this.authService.registerEmailAndPassword(user);
  }

  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  @UsePipes(new ZodValidationPipe(LoginUserSchema))
  @Post('/login')
  async login(
    @Req() req,
    @Res() res : Response,
  ) {

    const userId = req.user.id;
    const sessionId = req.session.id;


    const {sat, sct} = await this.authService.getSessionTokens(userId, sessionId);

    // TODO: move this logic to dedicated service
    res.cookie('_sat',sat, { httpOnly: true, expires: new Date(Date.now() + 60 * 60 * 1000), maxAge: 24 * 60 * 60 * 1000, sameSite:'strict' });
    res.cookie('_sct', sct, { httpOnly: true , expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), maxAge: 7 * 24 * 60 * 60 * 1000, sameSite:'strict' });

    res.send({
      message : "authenticated",
    })

  }
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(LoginUserSchema))
  @UseGuards(LocalAuthGuard)
  @Post('/token')
  getJwtTokens(
    @Req() req,
  ) {
    const userId = req.user.id;

    console.log("getJwtTokens user Id",userId);


    return this.authService.getJwtTokens(userId);
  }

  @UseGuards(JwtRefreshGuard)
  @Post('token/refresh')
  refreshToken(@Req() req) {
    return this.authService.refreshToken(req.user.id);
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


    const {sat, sct} = await this.authService.getSessionTokens(userId, sessionId);

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
    return this.authService.verifyEmail(code);
  }
}
