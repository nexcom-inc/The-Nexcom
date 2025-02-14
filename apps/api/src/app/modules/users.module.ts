import { Module } from "@nestjs/common";
import { AUTH_SERVICE, NestCommonModule, RABBITMQ_AUTH_QUEUE, RABBITMQ_USER_QUEUE, USER_SERVICE } from "@the-nexcom/nest-common";
import { UsersController } from "../controllers/users.controller";
import { UsersService } from "../services/users.service";
import { AuthService } from "../services/auth.service";

@Module({
  imports: [
    NestCommonModule.registerRmq(USER_SERVICE,RABBITMQ_USER_QUEUE),
    NestCommonModule.registerRmq(AUTH_SERVICE,RABBITMQ_AUTH_QUEUE),

  ],
  controllers: [UsersController],
  providers: [UsersService, AuthService]
})
export class UsersModule {}
