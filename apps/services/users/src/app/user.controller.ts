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



  @MessagePattern({cmd: 'get-user-by-email'})
  async getUserByEmail(
    @Payload() email : string,
    @Ctx() context : RmqContext
  ) {

    console.log("Get user by email", email);

    this.nestCommonService.aknowledgeMessage(context);
    return this.userService.getUserByEmail(email);
  }

  @MessagePattern({cmd: 'create-user'})
  async createUser(
    @Payload() user : CreateUserDto,
    @Ctx() context : RmqContext
  ) {

    this.nestCommonService.aknowledgeMessage(context);

    console.log("Create user", user);
    return this.userService.createUser(user);
  }

}
