/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ConfigService } from '@nestjs/config';
import { NestCommonService } from '@the-nexcom/nest-common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const nestCommonService = app.get(NestCommonService);

  const queue = configService.get('RABBITMQ_AUTH_QUEUE') ?? 'auth_queue';

  app.connectMicroservice(nestCommonService.getRmqOptions(queue));

  app.startAllMicroservices();

}

bootstrap();
