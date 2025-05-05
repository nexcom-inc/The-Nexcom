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

import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes';
import { ErrorInterceptor } from './interceptors';


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
  app.useGlobalInterceptors(new ErrorInterceptor());
  app.useGlobalFilters(new CustomExceptionFilter());

  app.enableCors({
    origin: 'http://localhost:3001',
    credentials: true,
  });



  app.use(cookieParser());

  const document = SwaggerModule.createDocument(app, config);
  const theme = new SwaggerTheme();
  SwaggerModule.setup(globalPrefix, app, document,{
    explorer: true,
    jsonDocumentUrl : "/docs/json",
    customSiteTitle: "NExcom API Documentation",
    customCss: theme.getBuffer(SwaggerThemeNameEnum.DARK),
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
