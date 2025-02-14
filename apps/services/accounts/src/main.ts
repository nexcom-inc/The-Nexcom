/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { NestFactory } from '@nestjs/core';
import { AccountModule } from './app/account.module';
import { NestCommonService, RABBITMQ_ACCOUNT_QUEUE } from '@the-nexcom/nest-common';

async function bootstrap() {
  const app = await NestFactory.create(AccountModule);
  const nestCommonService = app.get(NestCommonService);
  app.connectMicroservice(nestCommonService.getRmqOptions(RABBITMQ_ACCOUNT_QUEUE));
  app.startAllMicroservices();
}

bootstrap();
