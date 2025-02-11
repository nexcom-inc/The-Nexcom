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
    @Inject(REDIS) private readonly redisClient: RedisClientType
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
          id: userId
        },
        {
          secret: process.env.JWT_SECRET,
          expiresIn: '15m'
        }
      ),
      this.jwtService.signAsync(
        {
          id: userId
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

  async getUserFromHeader(jwt: string) {
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

    const newUser = await firstValueFrom(this.userService.send({ cmd: 'create-user' }, user));

    return this.authenticateUser(newUser.id);
  }


  // SESSION SECURITY ENHANCEMENT


  generateCryptoToken(length = 64) {
    return crypto.randomBytes(length).toString('hex');
  }

  async hashToken(token: string) {
    return  await argon2.hash(token);
  }

  async compareSessionToken(token: string, hashedToken: string) {
    console.log("token", token);
    console.log("hashedToken", hashedToken);

    const res =  await argon2.verify(hashedToken, token);

    console.log("TOkne matched", res);


    return res
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
  async validateSessionTokens(userId: string, sessionId: string, sat: string, sct: string): Promise<{ err: unknown; sat: string | undefined; }> {
      const hashedSatKey = `${process.env.SESSION_SESSION_TOKEN_ACCESS_KEY_PREFIX}${userId}:${sessionId}`;
      const hashedSctKey = `${process.env.SESSION_SESSION_CONTINUOUS_TOKEN_KEY_PREFIX}${userId}:${sessionId}`;

      const hashedSat = await this.redisClient.get(hashedSatKey);

      if(hashedSat && await this.compareSessionToken(sat, hashedSat)) {
        return {
          err: null,
          sat:undefined
        }
      }

      const hashedSct = await this.redisClient.get(hashedSctKey);
      if(hashedSct && await this.compareSessionToken(sct, hashedSct)) {

        return {
          err: null,
          sat: (await this.refreshSessionAccessToken(userId, sessionId, hashedSatKey)).sat
        }
      }

      return {
        err: true,
        sat: undefined
      }
  }
}
