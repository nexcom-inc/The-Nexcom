import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ResendService } from 'nestjs-resend';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../lib';
import { BcryptService, UserJwt } from '@the-nexcom/nest-common';

@Injectable()
export class AuthService {

  constructor(
    private readonly primsa: PrismaService,
    // private readonly bcrypt: BcryptService,
    private readonly resend: ResendService,
    private readonly jwtService: JwtService,
  ) {}


  async verifyToken(jwt: string) : Promise<{exp:number}> {
    if (!jwt) {
      throw new UnauthorizedException();
    }
    try {
      const { exp } =await this.jwtService.verify(jwt);

      return { exp };
    } catch (error) {
      throw new UnauthorizedException();
    }
    }

    async findUserByEmail(email: string) {
      return await this.primsa.user.findUnique({
        where: {
          email,
        },
      });
    }

    async findUserById(id: string) {
      return await this.primsa.user.findUnique({
        where: {
          id,
        },
      });
    }

    // async getUserFromHeader(jwt: string) {
    //   if (!jwt) return
    //   try {
    //     return this.jwtService.decode(jwt) as UserJwt
    //   } catch (error) {
    //     throw new BadRequestException()
    //   }
    // }
}
