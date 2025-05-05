import { Injectable } from "@nestjs/common";
import { Ctx, EventPattern, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { NestCommonService } from "@the-nexcom/nest-common";
import { UserAuthService } from "../services/user-auth.service";
import { CreateUserDto, LoginUserDto } from "@the-nexcom/dto";

@Injectable()
export class UserAuthController {

  constructor(
    private readonly userAuthService: UserAuthService,
    private readonly nestCommonService: NestCommonService
  ) {}

  @MessagePattern({ cmd : 'validate-email-password-user' })
  async validateEmailAndPassword(
    @Ctx() context : RmqContext,
    @Payload() user :LoginUserDto){


    this.nestCommonService.aknowledgeMessage(context)

    return this.userAuthService.validateEmailAndPasswordUser(user.email, user.password)
  }

  // @MessagePattern({ cmd : 'authenticate-user' })
  // async AuthenticateUser(
  //   @Ctx() context : RmqContext,
  //   @Payload() userId : string){

  //   this.nestCommonService.aknowledgeMessage(context)

  //   return this.userAuthService.authenticateUser(userId)
  // }

  @MessagePattern({ cmd : 'register-email-password' })
  async registerEmailPassword(
    @Ctx() context : RmqContext,
    @Payload() {user} : {user:CreateUserDto}){

    this.nestCommonService.aknowledgeMessage(context)

    return this.userAuthService.registerEmailPassword(user)
  }


}
