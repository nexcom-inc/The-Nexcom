/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { NestFactory } from '@nestjs/core';
import { AuthModule } from './app/auth.module';
import { NestCommonService, RABBITMQ_AUTH_QUEUE } from '@the-nexcom/nest-common';

async function bootstrap() {
  const app = await NestFactory.create(AuthModule);
  const nestCommonService = app.get(NestCommonService);
  app.connectMicroservice(nestCommonService.getRmqOptions(RABBITMQ_AUTH_QUEUE));
  app.startAllMicroservices();

}

bootstrap();
