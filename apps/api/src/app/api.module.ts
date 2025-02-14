import { Inject, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CustomRedisStore, REDIS, RedisModule, RedisService, SESSION_SESSION_ID_KEY_PREFIX } from '@the-nexcom/nest-common';
import { RedisClientType } from 'redis';
import session from 'express-session';
// import { UsersController } from './controllers/users.controller';

import passport from 'passport';
import googleOauthConfig from '../config/google/google-oauth.config';
import { AuthModule } from './modules/auth.module';
import { UsersModule } from './modules/users.module';

@Module({
  imports: [

    // CONFIG
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env',
      load: [googleOauthConfig],
    }),

    // APP MODULE
    AuthModule,
    UsersModule,

    // OTHER MODULE
    RedisModule,
  ],
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
      prefix:SESSION_SESSION_ID_KEY_PREFIX
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
            maxAge:7 * 24 * 60 * 60 * 1000,
          },
        }),
          passport.initialize(),
          passport.session()
      )
      .forRoutes('*');
  }
}
