/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ApiModule } from './app/api.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { CustomExceptionFilter } from './filters';
import cookieParser from 'cookie-parser';

import * as fs from 'fs'



const config = new DocumentBuilder()
  .setTitle('NexCom API')
  .setDescription('API documentation for NexCom')
  .setVersion('1.0')
  .addBearerAuth()
  .build();


async function bootstrap() {
  const app = await NestFactory.create(ApiModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  // app.useGlobalInterceptors(new ErrorInterceptor());
  app.useGlobalFilters(new CustomExceptionFilter());

  app.enableCors({
    origin: 'http://127.0.0.1:5500',
    credentials: true,
  });



  app.use(cookieParser());

  const document = SwaggerModule.createDocument(app, config);
  fs.writeFileSync("./docs/swagger-spec.json", JSON.stringify(document));
  SwaggerModule.setup(globalPrefix, app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
