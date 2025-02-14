import { Module } from "@nestjs/common";
import { AuthService } from "../services/auth.service";
import { AuthController } from "../controllers/auth.controller";
import { AUTH_SERVICE, NestCommonModule, RABBITMQ_AUTH_QUEUE, RABBITMQ_USER_QUEUE, USER_SERVICE } from "@the-nexcom/nest-common";
import { SessionSerializer } from "../../serializers/session.serializers";
import { SessionGuard } from "../../guards";
import { RefreshJwtBearerStrategy } from "../../strategies/refresh-bearer.startegy";
import { LocalStrategy } from "../../strategies/local.stategy";
import { GoogleStrategy } from "../../strategies/google.strategy";
import { PassportModule } from "@nestjs/passport";

@Module({
  imports: [
    NestCommonModule.registerRmq(AUTH_SERVICE, RABBITMQ_AUTH_QUEUE),
    // TEMP
    NestCommonModule.registerRmq(USER_SERVICE, RABBITMQ_USER_QUEUE),


    PassportModule.register({session: true}),
  ],
  controllers: [AuthController],
  providers: [AuthService,
              GoogleStrategy,
              LocalStrategy,
              RefreshJwtBearerStrategy,
              SessionGuard,
              SessionSerializer,
  ],
})
export class AuthModule {}
