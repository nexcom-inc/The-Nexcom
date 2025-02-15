import {
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs'; // Import firstValueFrom to convert Observable to Promise
import { JwtService } from '@nestjs/jwt';
import {  MAILING_SERVICE, REDIS, USER_SERVICE } from '@the-nexcom/nest-common';
import { RedisClientType } from 'redis';

@Injectable()
export class AuthService {

  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(USER_SERVICE) private readonly userService: ClientProxy,
    private readonly jwtService: JwtService,
    // Chose with redis to use
    @Inject(REDIS) private readonly redisClient: RedisClientType,
    // private readonly redisSercice: RedisService,
    @Inject(MAILING_SERVICE) private readonly mailService: ClientProxy
  ) {}

  async authenticateUser(userId : string) {

    const user = await firstValueFrom(this.userService.send({ cmd: 'get-user-by-id' }, userId));

    if (!user) {
      throw new RpcException({
        message: "User not found",
        status: 404
      });
    }

    if (!user.emailVerified) {
      throw new RpcException({
        message: "Email not verified",
        status: 401
      });
    }
  }

  // async login(user: LoginUserDto) {
  //   const { email, password } = user;

  //   const existingUser = await this.validateEmailAndPasswordUser(email, password);

  //   if (!existingUser) {
  //     throw new RpcException({
  //       message: "Invalid credentials",
  //       status: 401
  //     });
  //   }

  //   return this.authenticateUser(existingUser.id);

  // }


}
