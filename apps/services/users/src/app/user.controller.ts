import { Controller } from '@nestjs/common';
import { UserService } from './user.service';
import {  Ctx, EventPattern, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { CreateUserDto, createUserProviderSchema, OauthUserDto, OauthUserWithIdDto } from '@the-nexcom/dto';
import { NestCommonService } from '@the-nexcom/nest-common';
import { filterObjectBySchema } from '@the-nexcom/utils';

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
    this.nestCommonService.aknowledgeMessage(context);
    return this.userService.getUserByEmail(email);
  }

  @MessagePattern({cmd: 'get-user-by-id'})
  async getUserById(
    @Payload() id : string,
    @Ctx() context : RmqContext
  ) {
    this.nestCommonService.aknowledgeMessage(context);
    return this.userService.getUserById(id);
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


  @EventPattern('oauth_user_logged_in')
  oauthLogin(
    @Payload() user : OauthUserWithIdDto,
    @Ctx() context : RmqContext
  ) {
    this.nestCommonService.aknowledgeMessage(context);

    console.log("user oauth", user);

    const ft = filterObjectBySchema(user, createUserProviderSchema)

    console.log("fttt ", ft);


    this.userService.UpdateUserProviders(createUserProviderSchema.parse(ft))
  }

}
