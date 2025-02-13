import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { NestCommonService } from '../services/nest-common.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      expandVariables : true,
    })
  ],
  providers: [NestCommonService],
  exports: [NestCommonService],
})
export class NestCommonModule {
  static registerRmq(service: string, queue: string) : DynamicModule {

    const providers = [
      {
          provide: service,
          useFactory: (configService: ConfigService) => {
            const USER = configService.get('RABBITMQ_USER');
            const PASSWORD = configService.get('RABBITMQ_PASS');
            const HOST = configService.get('RABBITMQ_HOST');

            return ClientProxyFactory.create({
                      transport: Transport.RMQ,
                      options: {
                        urls: [`amqp://${USER}:${PASSWORD}@${HOST}:5672`],
                        queue,
                        queueOptions: {
                          durable: true,
                        },
                      },
             });
          }
          , inject: [ConfigService]
      }
  ]

      return {
          module: NestCommonModule,
          providers,
          exports: providers,
      }
  }
}
