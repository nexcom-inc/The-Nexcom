import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { NestCommonModule, PrismaService } from '@the-nexcom/nest-common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env',
    }),
    NestCommonModule.registerRmq('ACCOUNT_SERVICE', process.env.RABBITMQ_ACCOUNT_QUEUE ?? ''),
  ],
  controllers: [UserController],
  providers: [UserService, PrismaService],
})
export class UserModule {}
