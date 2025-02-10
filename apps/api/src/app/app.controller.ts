import { BadRequestException, Body, Controller, Get, Inject, Post, Session, UseGuards, UsePipes } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';


@Controller()
export class AppController {

  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
    @Inject('ACCOUNT_SERVICE') private readonly accountService: ClientProxy,
    @Inject('USER_SERVICE') private readonly userService: ClientProxy
  ) {}


}
