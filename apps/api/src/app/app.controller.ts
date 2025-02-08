import { BadRequestException, Body, Controller, Get, Inject, Post, UsePipes } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateUserDto, createUserSchema } from '@the-nexcom/dto';
import { ZodValidationPipe } from '@the-nexcom/nest-common';

@Controller()
export class AppController {

  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
    @Inject('ACCOUNT_SERVICE') private readonly accountService: ClientProxy,
    @Inject('USER_SERVICE') private readonly userService: ClientProxy
  ) {}

  @Get('/users')
  async getUser () {
    return this.authService.send({ cmd: 'get-user' }, {});
  }

  @Post('/users')
  @UsePipes(new ZodValidationPipe(createUserSchema))
  async createUser (
    @Body() user : CreateUserDto
  ) {

    console.log(user);

    // if (user.provider === 'EMAILANDPASSWORD' && !user.password) {
    //   throw new BadRequestException('Password is required')
    // }

    const res = this.userService.send({ cmd: 'create-user' }, user)
    return res
  }
}
