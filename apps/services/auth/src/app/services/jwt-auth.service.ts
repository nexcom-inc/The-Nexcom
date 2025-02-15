import { Inject, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  REDIS,
  REFRESH_TOKEN_KEY_PREFIX,
  UserJwt,
} from '@the-nexcom/nest-common';
import { RedisClientType } from 'redis';
import * as argon2 from 'argon2';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class JwtAuthService {
  private readonly logger = new Logger(JwtAuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    @Inject(REDIS) private readonly redisClient: RedisClientType
  ) {}

  async updateHashedRefreshToken(userId: string, refreshToken: string) {
    try {
      const hashedRefreshToken = await argon2.hash(refreshToken);
      const hashedRefreshTokenKey = `${REFRESH_TOKEN_KEY_PREFIX}${userId}`;
      await this.redisClient.set(hashedRefreshTokenKey, hashedRefreshToken, {
        EX: 60 * 60 * 24 * 7,
      });
    } catch (error) {
      this.logger.warn("une erreur s'est produite :", error?.message);
    }
  }

  async verifyRefreshToken(userId: string, refreshToken: string) {
    try {
      const hashedRefreshTokenKey = `${REFRESH_TOKEN_KEY_PREFIX}${userId}`;
      const hashedRefreshToken =
        (await this.redisClient.get(hashedRefreshTokenKey)) ?? '';

      if (!hashedRefreshToken) {
        throw new RpcException({
          message: 'Invalid refresh token',
          status: 401,
        });
      }

      const isRefreshTokenValid = await argon2.verify(
        hashedRefreshToken,
        refreshToken
      );

      if (!isRefreshTokenValid) {
        throw new RpcException({
          message: 'Invalid refresh token',
          status: 401,
        });
      }

      return { id: userId };
    } catch (err) {
      throw new RpcException({
        message: err.message,
        status: 401,
      });
    }
  }

  async genrerateAccessAndRefreshToken(userId: string) {
    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync({
        userId,
      }),
      this.jwtService.signAsync(
        {
          userId,
        },
        {
          expiresIn: '7d',
          secret: process.env.JWT_REFRESH_SECRET,
        }
      ),
    ]);

    await this.updateHashedRefreshToken(userId, refresh_token);

    return {
      access_token,
      refresh_token,
    };
  }

  async refreshToken(userId: string, refreshToken: string) {
    const isRefreshTokenValid = await this.verifyRefreshToken(userId, refreshToken);

    if (!isRefreshTokenValid) {
      throw new RpcException({
        message: 'Invalid refresh token',
        status: 401,
      });
    }

    return this.genrerateAccessAndRefreshToken(userId);
  }

  async verifyJwtToken(jwt: string): Promise<{ exp: number }> {
    if (!jwt) {
      throw new RpcException({
        message: 'invalide token',
        statusCode: 401,
      });
    }
    try {
      const { exp } = await this.jwtService.verifyAsync(jwt);
      return { exp };
    } catch (error) {
      throw new RpcException({
        message: error.message,
        statusCode: 401,
      });
    }
  }

  async decodeToken(jwt: string) {
    if (!jwt) return;
    try {
      return this.jwtService.decode(jwt) as UserJwt;
    } catch (error) {
      throw new RpcException({
        message: error.message,
        statusCode: 401,
      });
    }
  }
}
