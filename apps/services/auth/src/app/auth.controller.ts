import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Ctx, MessagePattern, RmqContext } from '@nestjs/microservices';
import { NestCommonService } from '@the-nexcom/nest-common';
import { PrismaService } from '../lib';

@Controller()
export class AuthController {
  constructor(private readonly appService: AuthService,
    private readonly nestCommonService: NestCommonService,
    private readonly primsa: PrismaService,
  ) {}

  @MessagePattern({cmd: 'get-user'})
  async getUser(@Ctx() context : RmqContext) {
    this.nestCommonService.aknowledgeMessage(context);
    return  this.primsa.user.findMany();
  }
}
