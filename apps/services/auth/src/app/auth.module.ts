import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MAILING_SERVICE, NestCommonModule, RABBITMQ_MAILING_QUEUE, RABBITMQ_USER_QUEUE, RedisModule, USER_SERVICE } from '@the-nexcom/nest-common';
import { PrismaService } from '../lib';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RcpJwtAuthGuard } from './guards/jwt.guard';

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
    // ConfigModule.forFeature(jwtRefreshConfig)
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, RcpJwtAuthGuard,
    JwtStrategy],
})
export class AuthModule {}
