import { Module } from '@nestjs/common';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { NestCommonModule, PrismaService } from '@the-nexcom/nest-common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env',
    }),
    NestCommonModule,
  ],
  controllers: [AccountController],
  providers: [AccountService, PrismaService],
})
export class AccountModule {}
