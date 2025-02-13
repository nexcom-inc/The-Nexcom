import { Body, Controller, Get, Inject, Post, Req, Session, UseGuards, UsePipes } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateUserDto, createUserSchema } from '@the-nexcom/dto';
import { ZodValidationPipe } from '@the-nexcom/nest-common';
import { Request } from 'express';
import {  SessionGuard } from '../../guards';

interface User {
  id: string
}


@Controller('users')
export class UsersController {

  constructor(
    @Inject('USER_SERVICE') private readonly userService: ClientProxy
  ) {}

  @UseGuards(SessionGuard)
  @Get('/me')
  async getUser (
    @Req() req : Request,
    @Session() session
  ) {

    return this.userService.send({ cmd: 'get-user-by-id' }, (req.user as User)?.id)
  }

  @Get('session')
  async getSession (
    @Session() session
  ) {
    return session
  }
}
