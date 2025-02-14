import { Injectable } from '@nestjs/common';
import { ResendService } from 'nestjs-resend';
import  ConfirmEmailTemplate  from '../../templates/auth/confirm-email';
import { DEFAULT_MAILING_ACTION_URL, DEFAULT_MAILING_FROM } from '@the-nexcom/constants';
import { CreateHtmlFromComponent } from '../../utils/create-html';


@Injectable()
export class MailingService {

  constructor(
    private readonly resend: ResendService,
  ) {}
  async sendConfirmationEmail(to: string, code: string) {
      const verifyUrl = `${DEFAULT_MAILING_ACTION_URL}/auth/verify-email?code=${code}`;
      const html = await CreateHtmlFromComponent(ConfirmEmailTemplate, { url: verifyUrl });
      await this.resend.send({
        from: DEFAULT_MAILING_FROM,
        to,
        subject: 'Confirmation de votre adresse email',
        html,
      });
  }
}
