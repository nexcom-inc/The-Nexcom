import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RESEND_API_KEY } from '@the-nexcom/constants';
import { NestCommonModule } from '@the-nexcom/nest-common';
import { ResendModule } from 'nestjs-resend';
import { MailingController } from '../controllers/mailing.controller';
import { MailingService } from '../services/mailing.service';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env.mailing',
    }),
    ResendModule.forRoot({
      apiKey: RESEND_API_KEY as string
    }),
    NestCommonModule
  ],
  controllers: [MailingController],
  providers: [MailingService],
})
export class MailingModule {}
