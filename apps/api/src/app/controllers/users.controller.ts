import { Controller, Get, Req, Session, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import {  SessionGuard } from '../../guards';
import { UsersService } from '../services/users.service';

interface User {
  id: string
}


@Controller('users')
export class UsersController {

  constructor(
    private readonly userService: UsersService
  ) {}

  @UseGuards(SessionGuard)
  @Get('/@me')
  async GetMe (
    @Req() req : Request,
  ) {

    return this.userService.getMe((req.user as User)?.id)
  }

  @Get('/@me/session')
  async getSession (
    @Session() session
  ) {
    return session
  }
}
