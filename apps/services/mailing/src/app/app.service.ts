import { Injectable } from '@nestjs/common';
import { ResendService } from 'nestjs-resend';
import { render } from '@react-email/components';
import  ConfirmEmailTemplate  from '../templates/auth/confirm-email';
import * as React from 'react';


@Injectable()
export class AppService {

  constructor(private readonly resend: ResendService) {}

  getData(): { message: string } {
    return { message: 'Hello API' };
  }

  async sendMail() {
    const html = await render(React.createElement(ConfirmEmailTemplate, { url: "https://google.com" }));


    await this.resend.send({
      from: 'nexcom@mouhamedlamotte.tech',
      to: 'mouhamedlamotte.dev@gmail.com',
      subject: 'Welcom to Nexcom',
      html: html
    });
    return { message: 'Mail sent' };
  }
}
