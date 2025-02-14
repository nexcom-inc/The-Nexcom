/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { NestFactory } from '@nestjs/core';
import { UserModule } from './app/user.module';
import { NestCommonService, RABBITMQ_USER_QUEUE } from '@the-nexcom/nest-common';

async function bootstrap() {
  const app = await NestFactory.create(UserModule);
  const nestCommonService = app.get(NestCommonService);
  app.connectMicroservice(nestCommonService.getRmqOptions(RABBITMQ_USER_QUEUE));
  app.startAllMicroservices();
}

bootstrap();
