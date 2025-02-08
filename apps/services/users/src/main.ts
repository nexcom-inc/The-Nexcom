/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { NestFactory } from '@nestjs/core';
import { UserModule } from './app/user.module';
import { ConfigService } from '@nestjs/config';
import { NestCommonService } from '@the-nexcom/nest-common';

async function bootstrap() {
  const app = await NestFactory.create(UserModule);
  const configService = app.get(ConfigService);
  const nestCommonService = app.get(NestCommonService);

  const queue = configService.get('RABBITMQ_USER_QUEUE') ?? 'user_queue';

  app.connectMicroservice(nestCommonService.getRmqOptions(queue));

  app.startAllMicroservices();
}

bootstrap();
