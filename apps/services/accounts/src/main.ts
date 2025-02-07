/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { NestFactory } from '@nestjs/core';
import { AccountModule } from './app/account.module';
import { ConfigService } from '@nestjs/config';
import { NestCommonService } from '@the-nexcom/nest-common';

async function bootstrap() {
  const app = await NestFactory.create(AccountModule);
  const configService = app.get(ConfigService);
  const nestCommonService = app.get(NestCommonService);

  const queue = configService.get('RABBITMQ_ACCOUNT_QUEUE') ?? 'account_queue';

  app.connectMicroservice(nestCommonService.getRmqOptions(queue));

  app.startAllMicroservices();
}

bootstrap();
