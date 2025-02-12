import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ResendModule } from 'nestjs-resend';
import { ConfigModule } from '@nestjs/config';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env',
    }),
    ResendModule.forRoot({
      apiKey: process.env.RESEND_API_KEY ?? '',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
