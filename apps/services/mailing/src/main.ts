/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MailingModule } from './app/modules/mailing.module';
import { NestCommonService, RABBITMQ_MAILING_QUEUE } from '@the-nexcom/nest-common';

async function bootstrap() {
  const logger = new Logger(MailingModule.name);
  const app = await NestFactory.create(MailingModule);
  const nestCommonService = app.get(NestCommonService);

  app.connectMicroservice(nestCommonService.getRmqOptions(RABBITMQ_MAILING_QUEUE));
  app.startAllMicroservices();

  logger.log(`🚀 Consumer for ${RABBITMQ_MAILING_QUEUE} is up and running`);
}

bootstrap();
