import { Injectable } from "@nestjs/common";
import { Ctx, MessagePattern, Payload, RmqContext } from "@nestjs/microservices";
import { OauthUserDto } from "@the-nexcom/dto";
import { NestCommonService } from "@the-nexcom/nest-common";
import { UserAuthService } from "../services/user-auth.service";

@Injectable()
export class OauthController {
  constructor(
    private readonly authUserService: UserAuthService,
    private readonly nestCommonService: NestCommonService
  ) {}

    @MessagePattern({ cmd : 'validate-aouth-user' })
    async validateOauthUser(
      @Ctx() context : RmqContext,
      @Payload() user : OauthUserDto){

      this.nestCommonService.aknowledgeMessage(context)

      return this.authUserService.validateOAuthUser(user)
    }

    // !shoul be replaced by authenticateUser
    @MessagePattern({ cmd : 'oauth-login' })
    async OAuthlogin(
      @Ctx() context : RmqContext,
      @Payload() {userId} : {userId:string}){


      this.nestCommonService.aknowledgeMessage(context)

      return {}
    }

}
