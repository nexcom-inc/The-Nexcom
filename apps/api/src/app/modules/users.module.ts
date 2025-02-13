import { Module } from "@nestjs/common";
import { NestCommonModule } from "@the-nexcom/nest-common";
import { UsersController } from "../controllers/users.controller";
import { UsersService } from "../services/users.service";
import { AuthService } from "../services/auth.service";

@Module({
  imports: [
    NestCommonModule.registerRmq('USER_SERVICE', process.env.RABBITMQ_USER_QUEUE ?? 'user_queue'),
    NestCommonModule.registerRmq('AUTH_SERVICE', process.env.RABBITMQ_AUTH_QUEUE ?? 'auth_queue'),

  ],
  controllers: [UsersController],
  providers: [UsersService, AuthService]
})
export class UsersModule {}
