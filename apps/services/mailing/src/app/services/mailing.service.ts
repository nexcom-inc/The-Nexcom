import { Injectable } from '@nestjs/common';
import { ResendService } from 'nestjs-resend';
import { render } from '@react-email/components';
import  ConfirmEmailTemplate  from '../../templates/auth/confirm-email';
import * as React from 'react';


@Injectable()
export class MailingService {

  constructor(
    private readonly resend: ResendService,
  ) {}


  async sendConfirmationEmail(to: string, code: string) {


      const verifyUrl = `${process.env.CLIENT_URL}/auth/verify-email?code=${code}`;

      const html = await render(React.createElement(ConfirmEmailTemplate, { url: verifyUrl }));

      await this.resend.send({
        from: 'nexcom@mouhamedlamotte.tech',
        to,
        subject: 'Verifier votre email',
        html,
      });
  }
}
