import { Injectable } from "@nestjs/common";
import { Ctx, EventPattern, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { SessionAuthService } from "../services/session-auth.service";
import { NestCommonService } from "@the-nexcom/nest-common";

@Injectable()
export class AuthSessionController {

  constructor(
    private readonly authSSessionService: SessionAuthService,
    private readonly nestCommonService: NestCommonService
  ) {}

    @MessagePattern({ cmd : 'update-session-token' })
    updateSessionToken(
      @Ctx() context : RmqContext,
      @Payload() {userId, sessionId} : {userId:string, sessionId:string}){
        this.nestCommonService.aknowledgeMessage(context)
        return this.authSSessionService.updateSessionTokenToRedis(userId, sessionId)
      }

    @MessagePattern({ cmd : 'validate-session-tokens' })
    validateSessionTokens(
      @Ctx() context : RmqContext,
      @Payload() {userId, sessionId, sat, sct} : {userId:string, sessionId:string, sat:string, sct:string}){
        this.nestCommonService.aknowledgeMessage(context)
        return this.authSSessionService.validateSessionTokens(userId, sessionId, sat, sct)
      }

     @EventPattern('clear_user_session_storage')
      async clearUserSessionStorage(
        @Ctx() context : RmqContext,
        @Payload() {userId, sessionId} : {userId:string, sessionId:string}){

        console.log("\n received clear user session storage in  auth microservice controller", userId, sessionId);
        console.log("\n acknowledging it");
        this.nestCommonService.aknowledgeMessage(context)
        console.log("\n sending it to clear user session storage in auth microservice service");
        this.authSSessionService.clearUserSessionStorage(userId, sessionId)
        }

        //
      @MessagePattern({ cmd : 'get-user-active-sessions' })
      async getUserActiveSessions(
        @Ctx() context : RmqContext,
        @Payload() userId : string){
          this.nestCommonService.aknowledgeMessage(context)
          return this.authSSessionService.getUserActiveSessions(userId)
        }
}
