import {
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';
import {  MAILING_SERVICE, REDIS, SESSION_SESSION_CONTINUOUS_TOKEN_KEY_PREFIX, SESSION_SESSION_TOKEN_ACCESS_KEY_PREFIX, SESSION_TRACK_USER_SESSION_KEY_PREFIX, USER_SERVICE } from '@the-nexcom/nest-common';
import * as argon2 from 'argon2';
import { RedisClientType } from 'redis';

import * as crypto from 'crypto';

@Injectable()
export class SessionAuthService {

  private readonly logger = new Logger(SessionAuthService.name);

  constructor(
    @Inject(USER_SERVICE) private readonly userService: ClientProxy,
    private readonly jwtService: JwtService,
    @Inject(REDIS) private readonly redisClient: RedisClientType,
    // private readonly redisSercice: RedisService,
    @Inject(MAILING_SERVICE) private readonly mailService: ClientProxy
  ) {}


  // TODO :  move to utils
  generateCryptoToken(length = 64) {
    return crypto.randomBytes(length).toString('hex');
  }
// TODO :  move to utils
  async hashToken(token: string) {
    return  await argon2.hash(token);
  }

  async compareSessionToken(token: string, hashedToken: string) {
    try {
      const res =  await argon2.verify(hashedToken, token);
      return res
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return false
    }

  }


  // TODO :  refact this to take one sessionToken
  async setSessionTokenToRedis(userId: string, sessionId: string, sat: string, sct: string): Promise<void> {

    const [hashedSat, hashedSct] = await Promise.all([
      this.hashToken(sat),
      this.hashToken(sct),
    ]);

    const hashedSatKey = `${SESSION_SESSION_TOKEN_ACCESS_KEY_PREFIX}${userId}:${sessionId}`;
    const hashedSctKey = `${SESSION_SESSION_CONTINUOUS_TOKEN_KEY_PREFIX}${userId}:${sessionId}`;

    await Promise.all([
      this.redisClient.set(hashedSatKey, hashedSat, {
        // exp in one day
        EX: 60 * 60 * 24
      }),
      this.redisClient.set(hashedSctKey, hashedSct,{
        EX: 60 * 60 * 24 * 7
      }),
    ]);
  }

  async updateSessionTokenToRedis(userId: string, sessionId: string): Promise<{ sat: string; sct: string; }> {

    const sat = this.generateCryptoToken();
    const sct = this.generateCryptoToken();

    await this.setSessionTokenToRedis(userId, sessionId, sat, sct);

    return { sat, sct };
  }

  async refreshSessionAccessToken(userId: string, sessionId: string, hashedSatKey: string): Promise<{sat: string}> {
    const sat = this.generateCryptoToken();
    await this.redisClient.set(hashedSatKey, sat, {
      // exp in one day
      EX: 60 * 60 * 24
    });

    return  {sat} ;
  }

  // TODO : refact this to delegates some logiques
  async validateSessionTokens(userId: string, sessionId: string, sat: string, sct: string): Promise<{ err: unknown; newSat: string | undefined; }> {
      const hashedSatKey = `${SESSION_SESSION_TOKEN_ACCESS_KEY_PREFIX}${userId}:${sessionId}`;
      const hashedSctKey = `${SESSION_SESSION_CONTINUOUS_TOKEN_KEY_PREFIX}${userId}:${sessionId}`;

      const hashedSat = await this.redisClient.get(hashedSatKey);



      if(hashedSat && sat) {



        if (await this.compareSessionToken(sat, hashedSat)) {
          return {
            err: null,
            newSat:undefined
          }
        }
      }


      const hashedSct = await this.redisClient.get(hashedSctKey);
      if(!hashedSct || !sct) {

        return {
          err: true,
          newSat: undefined
        }
      }

      if (await this.compareSessionToken(sct, hashedSct)) {

        return {
          err: null,
          newSat: (await this.refreshSessionAccessToken(userId, sessionId, hashedSatKey)).sat
        }
      }



      return {
        err: true,
        newSat: undefined
      }
  }

  async clearUserSessionStorage(userId: string, sessionId: string) {

    console.log("\n received clear user session storage in  auth microservice service", userId, sessionId);


    const hashedSatKey = `${SESSION_SESSION_TOKEN_ACCESS_KEY_PREFIX}${userId}:${sessionId}`;
    const hashedSctKey = `${SESSION_SESSION_CONTINUOUS_TOKEN_KEY_PREFIX}${userId}:${sessionId}`;
    const userSessionTrackkey = `${SESSION_TRACK_USER_SESSION_KEY_PREFIX}${userId}`

    console.log("\n hashedSatKey",hashedSatKey);
    console.log("\n hashedSctKey",hashedSctKey);


    await Promise.all([
      this.redisClient.del(hashedSatKey),
      this.redisClient.del(hashedSctKey),
      // this.redisClient.lRem(userSessionTrackkey, 0, JSON.stringify({ sessionId }))
    ]);
  }

  async getUserActiveSessions(userId: string) {
    const pattern = `${SESSION_TRACK_USER_SESSION_KEY_PREFIX}${userId}`;
    const userSessions = await this.redisClient.lRange(pattern, 0, -1);

    console.log("\n userSessions",userSessions);

    const parsedSessions = userSessions.map(session => JSON.parse(session));

    return parsedSessions
  }

}
