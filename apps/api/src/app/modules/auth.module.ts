import { Module } from "@nestjs/common";
import { AuthService } from "../services/auth.service";
import { AuthController } from "../controllers/auth.controller";
import { NestCommonModule } from "@the-nexcom/nest-common";

@Module({
  imports: [
    NestCommonModule.registerRmq('AUTH_SERVICE', process.env.RABBITMQ_AUTH_QUEUE ?? 'auth_queue'),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
