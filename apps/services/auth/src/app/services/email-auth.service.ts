import {
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs'; // Import firstValueFrom to convert Observable to Promise
import { JwtService } from '@nestjs/jwt';
import { CONFIRM_EMAIL_KEY_PREFIX, MAILING_SERVICE, REDIS, USER_SERVICE } from '@the-nexcom/nest-common';
import { RedisClientType } from 'redis';

import * as crypto from 'crypto';

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



  async sendEmailConfirmationCode(email: string) {

    const user = await firstValueFrom(
      this.userService.send({ cmd: 'get-user-by-email' }, email),
    );


    if (!user) return

    // const code = this.generateCryptoToken(64);
    const code = crypto.randomBytes(64).toString('hex');
    const key = `${CONFIRM_EMAIL_KEY_PREFIX}${code}`

    await this.redisClient.set(key, user.id,{
      EX: 60 * 15
    });


    this.mailService.emit('send_confirmation_email', {
      to: email,
      code
    })
  }


  async verifyEmail(code: string) {
    const key = `${CONFIRM_EMAIL_KEY_PREFIX}${code}`
    const userId =  await this.redisClient.get(key);

    if (!userId) {
      throw new RpcException({
        message: "Invalid code",
        status: 401
      });
    }

    this.userService.emit('update_user', {
      id: userId,
      data : {emailVerified: true}
    });

    await this.redisClient.del(key);

    return {
      userId,
      message: "Email verified"
    }
  }
}
