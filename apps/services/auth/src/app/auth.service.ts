import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { compare } from 'bcryptjs';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs'; // Import firstValueFrom to convert Observable to Promise
import { JwtService } from '@nestjs/jwt';
import {  CreateUserDto, LoginUserDto, OauthUserDto } from '@the-nexcom/dto';
import { REDIS, UserJwt } from '@the-nexcom/nest-common';
import * as argon2 from 'argon2';
import { RedisClientType } from 'redis';

import * as crypto from 'crypto';
import { AuthServiceInterface } from './interfaces/auth-service.interface';

@Injectable()
export class AuthService implements AuthServiceInterface {
  constructor(
    @Inject('USER_SERVICE') private readonly userService: ClientProxy,
    private readonly jwtService: JwtService,
    // Chose with redis to use
    @Inject(REDIS) private readonly redisClient: RedisClientType,
    // private readonly redisSercice: RedisService,
    @Inject('MAILING_SERVICE') private readonly mailService: ClientProxy
  ) {}


  async updateHashedRefreshToken(userId: string, refreshToken: string) {

    const hashedRefreshToken =  await argon2.hash(refreshToken);


    const hashedRefreshTokenKey = `auth:_rt:${userId}`;

    await this.redisClient.set(hashedRefreshTokenKey, hashedRefreshToken);
  }

  async verifyRefreshToken(userId: string, refreshToken: string) {




    try {
      const hashedRefreshTokenKey = `auth:_rt:${userId}`;
      const hashedRefreshToken = await this.redisClient.get(hashedRefreshTokenKey) ?? '';



      const isRefreshTokenValid = await argon2.verify(hashedRefreshToken, refreshToken);



      if (!isRefreshTokenValid) {
        throw new RpcException({
          message: 'Invalid refresh token',
          status: 401,
        });
      }

      return {id : userId};

    } catch (err) {
      throw new RpcException({
        message: err.message,
        status: 401
      });
    }
  }

  // ! same as authenticateUser
  async refreshToken(userId: string) {
    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(
        {
         userId
        },
        {
          secret: process.env.JWT_SECRET,
          expiresIn: '15m'
        }
      ),
      this.jwtService.signAsync(
        {
         userId
        },
        {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn: '7d'
        }
      ),
    ])


    await this.updateHashedRefreshToken(userId, refresh_token);

    return {
      access_token,
      refresh_token
    }
  }

  // ? is it really needed ?
  // * Yes it is needed because it's used in the controller (2025-10-01 22)
  async verifyToken(jwt: string) : Promise<{exp:number}> {
    if (!jwt) {


      throw new UnauthorizedException();
    }
    try {




      const { exp } =await this.jwtService.verifyAsync(jwt);



      return { exp };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {


      throw new UnauthorizedException();
    }
    }

  async  decodeToken(jwt: string) {
    if (!jwt) return
    try {
      return this.jwtService.decode(jwt) as UserJwt
    } catch (error) {
      throw new BadRequestException()
    }
  }



  async validateEmailAndPasswordUser(email: string, password: string) {
    // Convert the Observable to a Promise using firstValueFrom
    const user = await firstValueFrom(
      this.userService.send({ cmd: 'get-user-by-email' }, email),
    );

    const doesUserExist = !!user;

    if (!doesUserExist) return null;

    const isPasswordValid = await compare(
      password,
      user.password,
    );

    if (!isPasswordValid) return null;

    return {id : user.id};
  }

  async validateOAuthUser(user : OauthUserDto){
    const { email } = user;
    const existingUser  = await firstValueFrom(
      this.userService.send({ cmd: 'get-user-by-email' }, email),
    );

    if (existingUser) {
      this.userService.emit('oauth_user_logged_in',{
        userId : existingUser.id,
        ...user
      } );
      return {id : existingUser.id};
    }


    const newUser = await firstValueFrom(this.userService.send({ cmd: 'create-user' }, user));



    return { id : newUser.id }
  }

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


    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(
        {
          userId
        }
      ),
      this.jwtService.signAsync(
        {
          userId
        },
        {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn: '7d',
        },
      ),
    ])



    await this.updateHashedRefreshToken(userId, refresh_token);

    return {
      access_token,
      refresh_token
    }
  }

  async login(user: LoginUserDto) {
    const { email, password } = user;

    const existingUser = await this.validateEmailAndPasswordUser(email, password);

    if (!existingUser) {
      throw new RpcException({
        message: "Invalid credentials",
        status: 401
      });
    }

    return this.authenticateUser(existingUser.id);

  }

  async registerEmailPassword(user: CreateUserDto) {

    const existingUser = await firstValueFrom(
      this.userService.send({ cmd: 'get-user-by-email' }, user.email),
    );



    if (!user.password){
      throw new RpcException({
        message: "Password is required",
        status: 400
      });
    }

    if (existingUser) {
      throw new RpcException({
        message: "User already exists",
        status: 400
      });
    }

    await firstValueFrom(this.userService.send({ cmd: 'create-user' }, user));
    this.sendEmailConfirmationCode(user.email);
    return {message: "Un email de confirmation vous a ete envoye"}
  }


  // SESSION SECURITY ENHANCEMENT


  generateCryptoToken(length = 64) {
    return crypto.randomBytes(length).toString('hex');
  }

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

    const hashedSatKey = `${process.env.SESSION_SESSION_TOKEN_ACCESS_KEY_PREFIX}${userId}:${sessionId}`;
    const hashedSctKey = `${process.env.SESSION_SESSION_CONTINUOUS_TOKEN_KEY_PREFIX}${userId}:${sessionId}`;

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
      const hashedSatKey = `${process.env.SESSION_SESSION_TOKEN_ACCESS_KEY_PREFIX}${userId}:${sessionId}`;
      const hashedSctKey = `${process.env.SESSION_SESSION_CONTINUOUS_TOKEN_KEY_PREFIX}${userId}:${sessionId}`;

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

  async sendEmailConfirmationCode(email: string) {

    const user = await firstValueFrom(
      this.userService.send({ cmd: 'get-user-by-email' }, email),
    );


    if (!user) return

    const code = this.generateCryptoToken(64);
    const key = `${process.env.CONFIRM_EMAIL_KEY}${code}`

    await this.redisClient.set(key, user.id,{
      // exp in 15 mn
      EX: 60 * 15
    });




    this.mailService.emit('send_confirmation_email', {
      to: email,
      code
    })
  }


  async verifyEmail(code: string) {

    const key = `${process.env.CONFIRM_EMAIL_KEY}${code}`
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

  async clearUserSessionStorage(userId: string, sessionId: string) {

    console.log("\n received clear user session storage in  auth microservice service", userId, sessionId);


    const hashedSatKey = `${process.env.SESSION_SESSION_TOKEN_ACCESS_KEY_PREFIX}${userId}:${sessionId}`;
    const hashedSctKey = `${process.env.SESSION_SESSION_CONTINUOUS_TOKEN_KEY_PREFIX}${userId}:${sessionId}`;
    const userSessionTrackkey = `${process.env.SESSION_TRACK_USER_SESSION_KEY_PREFIX}${userId}`

    console.log("\n hashedSatKey",hashedSatKey);
    console.log("\n hashedSctKey",hashedSctKey);


    await Promise.all([
      this.redisClient.del(hashedSatKey),
      this.redisClient.del(hashedSctKey),
      // this.redisClient.lRem(userSessionTrackkey, 0, JSON.stringify({ sessionId }))
    ]);
  }

  async getUserActiveSessions(userId: string) {
    const pattern = `${process.env.SESSION_TRACK_USER_SESSION_KEY_PREFIX}${userId}`;
    const userSessions = await this.redisClient.lRange(pattern, 0, -1);

    console.log("\n userSessions",userSessions);

    const parsedSessions = userSessions.map(session => JSON.parse(session));

    return parsedSessions
  }

}
