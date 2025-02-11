import { Inject, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CustomRedisStore, NestCommonModule, REDIS, RedisModule, RedisService } from '@the-nexcom/nest-common';
import { ErrorInterceptor } from '../interceptors';
import { AuthController } from './controllers/auth/auth.controller';
import { GoogleStrategy } from '../strategies/google.strategy';
import { RedisClientType } from 'redis';
import session from 'express-session';
import { SessionSerializer } from '../serializers/session.serializers';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from '../strategies/local.stategy';
import { UsersController } from './controllers/users/users.controller';
import { JwtAuthGuard, JwtRefreshGuard, SessionGuard } from '../guards';

import passport from 'passport';
import googleOauthConfig from './config/google/google-oauth.config';
import { RefreshJwtBearerStrategy } from '../strategies/refresh-bearer.startegy';

@Module({
  imports: [

    // CONFIG
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env',
      load: [googleOauthConfig],
    }),

    // MICROSERVICES
    NestCommonModule.registerRmq('AUTH_SERVICE', process.env.RABBITMQ_AUTH_QUEUE ?? 'auth_queue'),
    NestCommonModule.registerRmq('ACCOUNT_SERVICE', process.env.RABBITMQ_ACCOUNT_QUEUE ?? 'account_queue'),
    NestCommonModule.registerRmq('USER_SERVICE', process.env.RABBITMQ_USER_QUEUE ?? 'user_queue'),


    // REDIS
    RedisModule,
    // RedisCacheModule,

    // PASSPORT
    PassportModule.register({session: true})
  ],
  controllers: [ AuthController, UsersController],
  providers: [
    // SERVICES

    // STRATEGIES
    GoogleStrategy,
    LocalStrategy,
    RefreshJwtBearerStrategy,

    // GUARDS
    SessionGuard,
    // JwtAuthGuard,
    // JwtRefreshGuard,

    // SERIALIZERS
    SessionSerializer,

    // INTERCEPTORS
    {provide : 'APP_INTERCEPTOR', useClass: ErrorInterceptor}],
})
export class ApiModule implements NestModule {
  constructor(
    @Inject(REDIS) private readonly redisClient: RedisClientType,
    private readonly redisService: RedisService
  ) {}

  configure(consumer: MiddlewareConsumer) {

    const redisStore = new CustomRedisStore({
      client: this.redisClient,
      redisService: this.redisService, // ➜ On passe RedisService à CustomRedisStore
      prefix: 'auth:session:sid:',
    });
    consumer
      .apply(
        session({
          store:  redisStore,
          saveUninitialized: false,
          secret: process.env.JWT_SECRET || 'secret',
          resave: false,
          cookie: {
            sameSite: true,
            httpOnly: true,
            maxAge: 60 * 60 * 1000,
          },
        }),
          passport.initialize(),
          passport.session()
      )
      .forRoutes('*');
  }
}
