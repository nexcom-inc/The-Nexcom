/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import * as fs from 'fs';


const config = new DocumentBuilder()
  .setTitle('NexCom API')
  .setDescription('API documentation for NexCom')
  .setVersion('1.0')
  .addBearerAuth()
  .build();


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  const document = SwaggerModule.createDocument(app, config);
  // fs.writeFileSync("./docs/swagger-spec.json/", JSON.stringify(document));
  SwaggerModule.setup(globalPrefix, app, document);

  const port = process.env.PORT || 5000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
