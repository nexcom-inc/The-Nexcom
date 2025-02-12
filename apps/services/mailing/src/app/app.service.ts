import { Injectable } from '@nestjs/common';
import { ResendService } from 'nestjs-resend';
import { render } from '@react-email/components';
import WelcomeEmail from '../templates/welcom';
import * as React from 'react';


@Injectable()
export class AppService {

  constructor(private readonly resend: ResendService) {}

  getData(): { message: string } {
    return { message: 'Hello API' };
  }

  async sendMail() {
    const html = await render(React.createElement(WelcomeEmail));

    await this.resend.send({
      from: 'nexcom@mouhamedlamotte.tech',
      to: 'mouhamedlamotte.dev@gmail.com',
      subject: 'Weclcom to Nexcom',
      html: html
    });
    return { message: 'Mail sent' };
  }
}
