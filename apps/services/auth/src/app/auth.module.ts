import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MAILING_SERVICE, NestCommonModule, RABBITMQ_MAILING_QUEUE, RABBITMQ_USER_QUEUE, RedisModule, USER_SERVICE } from '@the-nexcom/nest-common';
import { PrismaService } from '../lib';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmailAuthController } from './controllers/auth-email.controller';
import { JwtAuthController } from './controllers/jwt-auth.controller';
import { OauthController } from './controllers/oauth.controller';
import { SessionAuthController } from './controllers/session-auth.controller';
import { UserAuthController } from './controllers/user-auth.controller';
import { RcpJwtAuthGuard } from './guards/jwt.guard';
import { EmailAuthService } from './services/email-auth.service';
import { JwtAuthService } from './services/jwt-auth.service';
import { SessionAuthService } from './services/session-auth.service';
import { UserAuthService } from './services/user-auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [

    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env',
    }),

    NestCommonModule.registerRmq(USER_SERVICE, RABBITMQ_USER_QUEUE),
    NestCommonModule.registerRmq(MAILING_SERVICE, RABBITMQ_MAILING_QUEUE),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '7 d' },
      }),
      inject: [ConfigService],
    }),


    RedisModule,
  ],
  controllers: [AuthController, JwtAuthController, UserAuthController, SessionAuthController, OauthController, EmailAuthController],
  providers: [AuthService, PrismaService, RcpJwtAuthGuard,
    JwtStrategy, JwtAuthService, UserAuthService, SessionAuthService, EmailAuthService],
})
export class AuthModule {}
