import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NestCommonModule } from '@the-nexcom/nest-common';
import { PrismaService } from '../lib';
import { ResendModule } from 'nestjs-resend';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RcpJwtAuthGuard } from './guards/jwt.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env',
    }),
    NestCommonModule.registerRmq('USER_SERVICE', process.env.RABBITMQ_USER_QUEUE ?? 'user_queue'),
    ResendModule.forRoot({
      apiKey: process.env.RESEND_API_KEY ?? '',
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '7 d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, RcpJwtAuthGuard,
    JwtStrategy],
})
export class AuthModule {}
