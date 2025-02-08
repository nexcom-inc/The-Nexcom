import { Controller } from '@nestjs/common';
import { UserService } from './user.service';
import {  Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { CreateUserDto } from '@the-nexcom/dto';
import { NestCommonService } from '@the-nexcom/nest-common';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService,
  private readonly nestCommonService: NestCommonService
  ) {}

  @MessagePattern({cmd: 'create-user'})
  async createUser(
    @Payload() user : CreateUserDto,
    @Ctx() context : RmqContext
  ) {

    this.nestCommonService.aknowledgeMessage(context);
    return this.userService.createUser(user);
  }

}
