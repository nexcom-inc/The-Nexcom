/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { ErrorInterceptor } from './interceptors';
import { CustomExceptionFilter } from './filters';


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
  // app.useGlobalInterceptors(new ErrorInterceptor());
  app.useGlobalFilters(new CustomExceptionFilter());

  app.enableCors({
    origin: 'http://localhost:3001',
    credentials: true,
  });

  const document = SwaggerModule.createDocument(app, config);
  // fs.writeFileSync("./docs/swagger-spec.json/", JSON.stringify(document));
  SwaggerModule.setup(globalPrefix, app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
