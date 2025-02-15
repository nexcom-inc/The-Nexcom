  import {  Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Ctx, EventPattern, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { NestCommonService } from '@the-nexcom/nest-common';
import { CreateUserDto, LoginUserDto } from '@the-nexcom/dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService,
    private readonly nestCommonService: NestCommonService,
  ) {}

  // ! to be removed
  // @MessagePattern({ cmd : 'login-email-password' })
  // async login(
  //   @Ctx() context : RmqContext,
  //   @Payload() {user} : {user:LoginUserDto}){


  //   this.nestCommonService.aknowledgeMessage(context)

  //   // return this.authService.login(user)
  // }

  // @MessagePattern({ cmd : 'validate-email-password-user' })
  // async validateEmailAndPassword(
  //   @Ctx() context : RmqContext,
  //   @Payload() user :LoginUserDto){


  //   this.nestCommonService.aknowledgeMessage(context)

  //   return this.authService.validateEmailAndPasswordUser(user.email, user.password)
  // }

  // @MessagePattern({ cmd : 'authenticate-user' })
  // async AuthenticateUser(
  //   @Ctx() context : RmqContext,
  //   @Payload() userId : string){

  //   this.nestCommonService.aknowledgeMessage(context)

  //   return this.authService.authenticateUser(userId)
  // }

  // @MessagePattern({ cmd : 'register-email-password' })
  // async registerEmailPassword(
  //   @Ctx() context : RmqContext,
  //   @Payload() {user} : {user:CreateUserDto}){

  //   this.nestCommonService.aknowledgeMessage(context)

  //   return this.authService.registerEmailPassword(user)
  // }




  // @MessagePattern({ cmd : 'verify-email' })
  // verifyEmail(
  //   @Ctx() context : RmqContext,
  //   @Payload() code : string){
  //     this.nestCommonService.aknowledgeMessage(context)
  //     return this.authService.verifyEmail(code)
  //   }




  // //SUBSCRIBE TO EVENTS
  // @EventPattern('send_verification_email')
  // sendVerificationEmail(
  //   @Ctx() context : RmqContext,
  //   @Payload() email : string){
  //     console.log("sendVerificationEmail",email);

  //     this.nestCommonService.aknowledgeMessage(context)
  //     this.authService.sendEmailConfirmationCode(email)
  //   }

}
