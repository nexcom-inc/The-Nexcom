import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { NestCommonModule } from '@the-nexcom/nest-common';
import { ErrorInterceptor } from '../interceptors';
import { AuthController } from './controllers/auth/auth.controller';
import googleOauthConfig from './config/google-oauth.config';
import { GoogleStrategy } from '../strategies/google.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env',
    }),
    NestCommonModule.registerRmq('AUTH_SERVICE', process.env.RABBITMQ_AUTH_QUEUE ?? 'auth_queue'),
    NestCommonModule.registerRmq('ACCOUNT_SERVICE', process.env.RABBITMQ_ACCOUNT_QUEUE ?? 'account_queue'),
    NestCommonModule.registerRmq('USER_SERVICE', process.env.RABBITMQ_USER_QUEUE ?? 'user_queue'),

    // GOOGLE OAUTH
    ConfigModule.forFeature(
      googleOauthConfig
    )
  ],
  controllers: [AppController, AuthController],
  providers: [AppService,GoogleStrategy ,{
    provide : 'APP_INTERCEPTOR',
    useClass: ErrorInterceptor
  }],
})
export class AppModule {}
