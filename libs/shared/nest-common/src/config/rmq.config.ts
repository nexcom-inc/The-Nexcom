import { registerAs } from "@nestjs/config";
import { ClientOptions, Transport } from "@nestjs/microservices";

export default registerAs ('rmq', () : ClientOptions => ({

  transport: Transport.RMQ,
  options: {
    urls: [`amqp://${process.env["RABBITMQ_USER"]}:${process.env["PASSWORD"]}@${process.env["HOST"]}:5672`],
    queue: process.env["RABBITMQ_AUTH_QUEUE"],
    queueOptions: {
      durable: true,
    },
  },
}));
