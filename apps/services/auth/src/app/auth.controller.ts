import { Controller, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { NestCommonService } from '@the-nexcom/nest-common';
import { PrismaService } from '../lib';
import { JwtAuthGuard } from './guards/jwt.guard';
import { CreateUserDto, LoginUserDto, validateOauthUserDto } from '@the-nexcom/dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService,
    private readonly nestCommonService: NestCommonService,
    private readonly primsa: PrismaService,
  ) {}

  @MessagePattern({ cmd : 'verify-token' })
  @UseGuards(JwtAuthGuard)
  async verifyToken(
    @Ctx() context : RmqContext,
    @Payload() payload : {jwt:string}){


      console.log("verify token", payload.jwt);


    this.nestCommonService.aknowledgeMessage(context)

    return this.authService.verifyToken(payload.jwt)
  }

  @MessagePattern({ cmd : 'decode-token' })
  async decodeToken(
    @Ctx() context : RmqContext,
    @Payload() payload : {jwt:string}
  ){
    this.nestCommonService.aknowledgeMessage(context)

    return this.authService.getUserFromHeader(payload.jwt)
  }


  @MessagePattern({ cmd : 'login-email-password' })
  async login(
    @Ctx() context : RmqContext,
    @Payload() {user} : {user:LoginUserDto}){
      console.log("login", user);


    this.nestCommonService.aknowledgeMessage(context)

    return this.authService.login(user)
  }

  @MessagePattern({ cmd : 'validate-aouth-user' })
  async validateOauthUser(
    @Ctx() context : RmqContext,
    @Payload() user : validateOauthUserDto){
      console.log("validateOauthUser", user);

    this.nestCommonService.aknowledgeMessage(context)

    return this.authService.validateOAuthUser(user)
  }

  @MessagePattern({ cmd : 'oauth-login' })
  async OAuthlogin(
    @Ctx() context : RmqContext,
    @Payload() {userId} : {userId:string}){


    this.nestCommonService.aknowledgeMessage(context)

    return this.authService.authenticateUser(userId)
  }
}
