import { Module } from '@nestjs/common';
import { MailingController } from '../controllers/mailing.controller';
import { MailingService } from '../services/mailing.service';
import { ResendModule } from 'nestjs-resend';
import { ConfigModule } from '@nestjs/config';
import { NestCommonModule } from '@the-nexcom/nest-common';
import { RESEND_API_KEY } from '@the-nexcom/constants';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env',
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
