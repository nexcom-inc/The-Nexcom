import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { NestCommonService } from '@the-nexcom/nest-common';
import { JwtAuthService } from '../services/jwt-auth.service';
import { RcpJwtAuthGuard } from '../guards/jwt.guard';
import { Controller, UseGuards } from '@nestjs/common';


@Controller()
export class JwtAuthController {
  constructor(
    private readonly jwtAuthService: JwtAuthService,
    private readonly nestCommonService: NestCommonService
  ){}

    @MessagePattern({ cmd : 'get-jwt-tokens' })
    getJwt(
      @Ctx() context : RmqContext,
      @Payload() userId : string){
        console.log("user id pattern",userId);
        this.nestCommonService.aknowledgeMessage(context)
        return this.jwtAuthService.genrerateAccessAndRefreshToken(userId)
      }

    @MessagePattern({ cmd : 'refresh-token' })
    refreshToken(
      @Ctx() context : RmqContext,
      @Payload() userId : string){
        this.nestCommonService.aknowledgeMessage(context)
        // ? should be refresh
        return this.jwtAuthService.genrerateAccessAndRefreshToken(userId)
      }


            @MessagePattern({ cmd : 'verify-token' })
        @UseGuards(RcpJwtAuthGuard)
        async verifyToken(
          @Ctx() context : RmqContext,
          @Payload() payload : {jwt:string}){
          this.nestCommonService.aknowledgeMessage(context)
          return this.jwtAuthService.verifyJwtToken(payload.jwt)
        }

        @MessagePattern({ cmd : 'decode-token' })
        async decodeToken(
          @Ctx() context : RmqContext,
          @Payload() payload : {jwt:string}
        ){
          this.nestCommonService.aknowledgeMessage(context)

          return this.jwtAuthService.decodeToken(payload.jwt)
        }

        @MessagePattern({ cmd : 'verify-refresh-token' })
        async verifyRefreshToken(
          @Ctx() context : RmqContext,
          @Payload() {userId, refreshToken} : {userId:string, refreshToken:string}){



          this.nestCommonService.aknowledgeMessage(context)

          return this.jwtAuthService.verifyRefreshToken(userId, refreshToken)
        }

}
