import { Injectable } from "@nestjs/common";
import { Ctx, EventPattern, MessagePattern, Payload, RmqContext } from "@nestjs/microservices";
import { NestCommonService } from "@the-nexcom/nest-common";
import { EmailAuthService } from "../services/email-auth.service";

@Injectable()
export class EmailAuthController {
  constructor(
    private readonly emailAuthService: EmailAuthService,
    private readonly nestCommonService: NestCommonService
  ) {}

  @MessagePattern({ cmd : 'verify-email' })
  verifyEmail(
    @Ctx() context : RmqContext,
    @Payload() code : string){
      this.nestCommonService.aknowledgeMessage(context)
      return this.emailAuthService.verifyEmail(code)
    }




  //SUBSCRIBE TO EVENTS
  @EventPattern('send_verification_email')
  sendVerificationEmail(
    @Ctx() context : RmqContext,
    @Payload() email : string){
      console.log("sendVerificationEmail",email);

      this.nestCommonService.aknowledgeMessage(context)
      this.emailAuthService.sendEmailConfirmationCode(email)
    }


}
