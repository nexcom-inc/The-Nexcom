import { Controller } from '@nestjs/common';
import { AccountService } from './account.service';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { CreateAccountDto } from '@the-nexcom/dto';
import { NestCommonService } from '@the-nexcom/nest-common';

@Controller()
export class AccountController {
  constructor(
    private readonly appService: AccountService,
    private readonly nestCommonService: NestCommonService
  ) {}

  @EventPattern('user_created')
  createAccount(
    @Payload() account : CreateAccountDto,
    @Ctx() context : RmqContext
  ) {
    this.nestCommonService.aknowledgeMessage(context);
    this.appService.createAccount(account);
  }
}
