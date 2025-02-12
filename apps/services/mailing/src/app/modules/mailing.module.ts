import { Module } from '@nestjs/common';
import { MailingController } from '../controllers/mailing.controller';
import { MailingService } from '../services/mailing.service';
import { ResendModule } from 'nestjs-resend';
import { ConfigModule } from '@nestjs/config';
import { NestCommonModule, RedisModule } from '@the-nexcom/nest-common';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env',
    }),
    ResendModule.forRoot({
      apiKey: process.env.RESEND_API_KEY ?? '',
    }),
    RedisModule,
    NestCommonModule
  ],
  controllers: [MailingController],
  providers: [MailingService],
})
export class MailingModule {}
