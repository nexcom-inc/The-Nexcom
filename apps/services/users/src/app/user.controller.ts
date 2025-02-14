import { Controller } from '@nestjs/common';
import { UserService } from './user.service';
import {  Ctx, EventPattern, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { CreateUserDto, createUserProviderSchema, OauthUserWithIdDto } from '@the-nexcom/dto';
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
    if (!email) return;
    return this.userService.getUserByEmail(email);
  }

  @MessagePattern({cmd: 'get-user-by-id'})
  async getUserById(
    @Payload() id : string,
    @Ctx() context : RmqContext
  ) {
    this.nestCommonService.aknowledgeMessage(context);
    if (!id) return;
    return this.userService.getUserById(id);
  }

  @MessagePattern({cmd: 'create-user'})
  async createUser(
    @Payload() user : CreateUserDto,
    @Ctx() context : RmqContext
  ) {

    this.nestCommonService.aknowledgeMessage(context);

    return this.userService.createUser(user);
  }


  @EventPattern('oauth_user_logged_in')
  oauthLogin(
    @Payload() user : OauthUserWithIdDto,
    @Ctx() context : RmqContext
  ) {
    this.nestCommonService.aknowledgeMessage(context);
    if (!user) return;

    // ! this function is not safe
    const providerDetails = filterObjectBySchema(user, createUserProviderSchema)


    this.userService.updateUser(user.userId, {
      emailVerified : true
    } as CreateUserDto)
    this.userService.UpdateUserProviders(createUserProviderSchema.parse(providerDetails))
  }


  @EventPattern('update_user')
  updateUser(
    @Payload() payload : {
      id : string,
      data : CreateUserDto
    },
    @Ctx() context : RmqContext
  ){
    this.nestCommonService.aknowledgeMessage(context);
    this.userService.updateUser(payload.id, payload.data)
  }
}
