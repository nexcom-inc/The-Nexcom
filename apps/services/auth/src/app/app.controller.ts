import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import { Ctx, MessagePattern, RmqContext } from '@nestjs/microservices';
import { NestCommonService } from '@the-nexcom/nest-common';
import { PrismaService } from '../lib';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService,
    private readonly nestCommonService: NestCommonService,
    private readonly primsa: PrismaService,
  ) {}

  @MessagePattern({cmd: 'get-user'})
  async getUser(@Ctx() context : RmqContext) {
    this.nestCommonService.aknowledgeMessage(context);
    return  this.primsa.user.findMany();
  }
}
