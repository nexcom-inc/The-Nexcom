import { Injectable } from '@nestjs/common';
import { DEFAULT_MAILING_ACTION_URL, DEFAULT_MAILING_FROM, RESEND_API_KEY } from '@the-nexcom/constants';
import { ResendService } from 'nestjs-resend';
import ConfirmEmailTemplate from '../../templates/auth/confirm-email';
import { CreateHtmlFromComponent } from '../../utils/create-html';


@Injectable()
export class MailingService {

  constructor(
    private readonly resend: ResendService,
  ) {}
  async sendConfirmationEmail(to: string, code: string) {

    console.log("api key", RESEND_API_KEY);

      const verifyUrl = `${DEFAULT_MAILING_ACTION_URL}/auth/verify-email?code=${code}`;
      const html = await CreateHtmlFromComponent(ConfirmEmailTemplate, { url: verifyUrl });

      const  { error, data } =  await this.resend.send({
        from: DEFAULT_MAILING_FROM,
        to,
        subject: 'Confirmation de votre adresse email',
        html,
      });

      if (error) {
       console.log("error", error);
      }

      if (data) {
        console.log("data", data);
      }
  }
}
