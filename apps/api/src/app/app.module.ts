import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { NestCommonModule } from '@the-nexcom/nest-common';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env',
    }),
    NestCommonModule.registerRmq('AUTH_SERVICE', process.env.RABBITMQ_AUTH_QUEUE ?? 'auth_queue'),
    NestCommonModule.registerRmq('ACCOUNT_SERVICE', process.env.RABBITMQ_ACCOUNT_QUEUE ?? 'account_queue'),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
