import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ACCOUNT_SERVICE, NestCommonModule, PrismaService, RABBITMQ_ACCOUNT_QUEUE } from '@the-nexcom/nest-common';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env',
    }),
    NestCommonModule.registerRmq(ACCOUNT_SERVICE, RABBITMQ_ACCOUNT_QUEUE),
  ],
  controllers: [UserController, AccountController],
  providers: [UserService, PrismaService, AccountService],
})
export class UserModule {}
