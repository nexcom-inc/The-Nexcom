import { Injectable } from '@nestjs/common';
import { ResendService } from 'nestjs-resend';
import { render } from '@react-email/components';
import  ConfirmEmailTemplate  from '../../templates/auth/confirm-email';
import * as React from 'react';
import * as crypto from 'crypto';
import { RedisService } from '@the-nexcom/nest-common';


@Injectable()
export class MailingService {

  constructor(
    private readonly resend: ResendService,
    private readonly redisSercice: RedisService
  ) {}


  async sendConfirmationEmail(to: string, userId: string) {
      const code = crypto.randomBytes(64).toString('hex');

      await this.redisSercice.set(`${process.env.CONFIRM_EMAIL_KEY}${userId}`, code, 60 * 60 * 24);

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
