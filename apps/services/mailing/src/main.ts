/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MailingModule } from './app/modules/mailing.module';
import { ConfigService } from '@nestjs/config';
import { NestCommonService } from '@the-nexcom/nest-common';

async function bootstrap() {
  const logger = new Logger(MailingModule.name);
  const app = await NestFactory.create(MailingModule);
  const configService = app.get(ConfigService);
  const nestCommonService = app.get(NestCommonService);

  const queue = configService.get('RABBITMQ_MAILING_QUEUE') ?? 'MAILING_QUEUE';

  app.connectMicroservice(nestCommonService.getRmqOptions(queue));
  app.startAllMicroservices();

  logger.log(`🚀 Consumer for ${queue} is up and running`);
}

bootstrap();
