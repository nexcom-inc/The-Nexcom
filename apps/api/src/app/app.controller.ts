import { Body, Controller, Get, Inject, Post, UsePipes } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { LoginUserDto, LoginUserSchema } from '@the-nexcom/dto';
import { ZodValidationPipe } from '@the-nexcom/nest-common';

@Controller()
export class AppController {

  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
    @Inject('ACCOUNT_SERVICE') private readonly accountService: ClientProxy
  ) {}

  @Get('/users')
  async getUser () {
    return this.authService.send({ cmd: 'get-user' }, {});
  }

  @Post('/users')
  // @UsePipes(new ZodValidationPipe(LoginUserSchema))
  async createUser (
    @Body() user : LoginUserDto

  ) {
    this.accountService.emit('user_created', user);
    return user
  }
}
