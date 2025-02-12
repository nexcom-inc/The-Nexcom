import { Controller, Logger } from '@nestjs/common';
import { MailingService } from '../services/mailing.service';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { NestCommonService } from '@the-nexcom/nest-common';

@Controller()
export class MailingController {
  private readonly logger = new Logger(MailingController.name);

  constructor(
    private readonly mailService: MailingService,
    private readonly nestCommonService: NestCommonService
  ) {
  }

  @EventPattern('send_confirmation_email')
  async sendConfirmationEmail(
    @Payload() data: { to: string; userId: string },
    @Ctx() context : RmqContext,
  ) {
    this.nestCommonService.aknowledgeMessage(context);
    try {
      const { to, userId } = data;
      await this.mailService.sendConfirmationEmail(to, userId);
    } catch (error) {
      this.logger.error(error);
    }
  }
}
