import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ACCOUNT_SERVICE, NestCommonModule, PrismaService, RABBITMQ_ACCOUNT_QUEUE } from '@the-nexcom/nest-common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env',
    }),
    NestCommonModule.registerRmq(ACCOUNT_SERVICE, RABBITMQ_ACCOUNT_QUEUE),
  ],
  controllers: [UserController],
  providers: [UserService, PrismaService],
})
export class UserModule {}
