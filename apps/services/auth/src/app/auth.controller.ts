  import {  Controller, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Ctx, EventPattern, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { NestCommonService } from '@the-nexcom/nest-common';
import { PrismaService } from '../lib';
import { RcpJwtAuthGuard } from './guards/jwt.guard';
import { CreateUserDto, LoginUserDto, OauthUserDto } from '@the-nexcom/dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService,
    private readonly nestCommonService: NestCommonService,
    private readonly primsa: PrismaService,
  ) {}

  @MessagePattern({ cmd : 'verify-token' })
  @UseGuards(RcpJwtAuthGuard)
  async verifyToken(
    @Ctx() context : RmqContext,
    @Payload() payload : {jwt:string}){




    this.nestCommonService.aknowledgeMessage(context)

    return this.authService.verifyToken(payload.jwt)
  }

  @MessagePattern({ cmd : 'decode-token' })
  async decodeToken(
    @Ctx() context : RmqContext,
    @Payload() payload : {jwt:string}
  ){
    this.nestCommonService.aknowledgeMessage(context)

    return this.authService.decodeToken(payload.jwt)
  }

  // ! to be removed
  @MessagePattern({ cmd : 'login-email-password' })
  async login(
    @Ctx() context : RmqContext,
    @Payload() {user} : {user:LoginUserDto}){


    this.nestCommonService.aknowledgeMessage(context)

    return this.authService.login(user)
  }

  @MessagePattern({ cmd : 'validate-email-password-user' })
  async validateEmailAndPassword(
    @Ctx() context : RmqContext,
    @Payload() user :LoginUserDto){


    this.nestCommonService.aknowledgeMessage(context)

    return this.authService.validateEmailAndPasswordUser(user.email, user.password)
  }

  @MessagePattern({ cmd : 'validate-aouth-user' })
  async validateOauthUser(
    @Ctx() context : RmqContext,
    @Payload() user : OauthUserDto){

    this.nestCommonService.aknowledgeMessage(context)

    return this.authService.validateOAuthUser(user)
  }

  // !shoul be replaced by authenticateUser
  @MessagePattern({ cmd : 'oauth-login' })
  async OAuthlogin(
    @Ctx() context : RmqContext,
    @Payload() {userId} : {userId:string}){


    this.nestCommonService.aknowledgeMessage(context)

    return this.authService.authenticateUser(userId)
  }

  @MessagePattern({ cmd : 'authenticate-user' })
  async AuthenticateUser(
    @Ctx() context : RmqContext,
    @Payload() userId : string){

    this.nestCommonService.aknowledgeMessage(context)

    return this.authService.authenticateUser(userId)
  }

  @MessagePattern({ cmd : 'register-email-password' })
  async registerEmailPassword(
    @Ctx() context : RmqContext,
    @Payload() {user} : {user:CreateUserDto}){

    this.nestCommonService.aknowledgeMessage(context)

    return this.authService.registerEmailPassword(user)
  }

  @MessagePattern({ cmd : 'verify-refresh-token' })
  async verifyRefreshToken(
    @Ctx() context : RmqContext,
    @Payload() {userId, refreshToken} : {userId:string, refreshToken:string}){



    this.nestCommonService.aknowledgeMessage(context)

    return this.authService.verifyRefreshToken(userId, refreshToken)
  }

  // SESSION SECURITY ENHANCEMENT
  @MessagePattern({ cmd : 'update-session-token' })
  updateSessionToken(
    @Ctx() context : RmqContext,
    @Payload() {userId, sessionId} : {userId:string, sessionId:string}){
      this.nestCommonService.aknowledgeMessage(context)
      return this.authService.updateSessionTokenToRedis(userId, sessionId)
    }

  @MessagePattern({ cmd : 'validate-session-tokens' })
  validateSessionTokens(
    @Ctx() context : RmqContext,
    @Payload() {userId, sessionId, sat, sct} : {userId:string, sessionId:string, sat:string, sct:string}){
      this.nestCommonService.aknowledgeMessage(context)
      return this.authService.validateSessionTokens(userId, sessionId, sat, sct)
    }

  @MessagePattern({ cmd : 'verify-email' })
  verifyEmail(
    @Ctx() context : RmqContext,
    @Payload() code : string){
      this.nestCommonService.aknowledgeMessage(context)
      return this.authService.verifyEmail(code)
    }

  @MessagePattern({ cmd : 'get-jwt-tokens' })
  getJwt(
    @Ctx() context : RmqContext,
    @Payload() userId : string){
      console.log("user id pattern",userId);

      this.nestCommonService.aknowledgeMessage(context)
      return this.authService.authenticateUser(userId)
    }

  @MessagePattern({ cmd : 'refresh-token' })
  refreshToken(
    @Ctx() context : RmqContext,
    @Payload() userId : string){
      this.nestCommonService.aknowledgeMessage(context)
      return this.authService.refreshToken(userId)
    }



  //SUBSCRIBE TO EVENTS
  @EventPattern('send_verification_email')
  sendVerificationEmail(
    @Ctx() context : RmqContext,
    @Payload() email : string){
      console.log("sendVerificationEmail",email);

      this.nestCommonService.aknowledgeMessage(context)
      this.authService.sendEmailConfirmationCode(email)
    }

  @EventPattern('clear_user_session_storage')
  async clearUserSessionStorage(
    @Ctx() context : RmqContext,
    @Payload() {userId, sessionId} : {userId:string, sessionId:string}){

    console.log("\n received clear user session storage in  auth microservice controller", userId, sessionId);
    console.log("\n acknowledging it");
    this.nestCommonService.aknowledgeMessage(context)
    console.log("\n sending it to clear user session storage in auth microservice service");
    this.authService.clearUserSessionStorage(userId, sessionId)
    }

    //
  @MessagePattern({ cmd : 'get-user-active-sessions' })
  async getUserActiveSessions(
    @Ctx() context : RmqContext,
    @Payload() userId : string){
      this.nestCommonService.aknowledgeMessage(context)
      return this.authService.getUserActiveSessions(userId)
    }
}
