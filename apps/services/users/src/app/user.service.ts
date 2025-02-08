import {  Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { createAccountSchema, CreateUserDto, CreateUserProviderDto, createUserProviderSchema } from '@the-nexcom/dto';
import { PrismaService } from '@the-nexcom/nest-common';
import { filterObjectBySchema } from '@the-nexcom/utils';

@Injectable()
export class UserService {

  constructor(
    // NestCommonService
    private readonly primsa : PrismaService,

    // Rmq services
    @Inject('ACCOUNT_SERVICE') private readonly accountService: ClientProxy
  ) {}


  async getUserByEmail(email: string) {
    try {
      return await this.primsa.user.findUnique({
        where: {
          email,
        },
      });
    } catch (error) {
        Logger.log('une erreur s\'est produite :', error?.message);
    }

  }

  async getUserById(id: string) {
    try {
      return await this.primsa.user.findUnique({
        where: {
          id,
        },
      });
    } catch (error) {
        Logger.log('une erreur s\'est produite :', error?.message);
    }
  }

  async createUser(user: CreateUserDto) {

    // check if user already exists
    const exisTingUser = await this.getUserByEmail(user.email)

    if (exisTingUser) {
      throw new RpcException({
        message: "User with this email already exists",
        status: 400
      })
    }

    try {
      const newUser =  await this.primsa.user.create({
        data: {
          email: user.email,
          password: user.password
        },
        select: {
          id: true,
          email: true
        }
      });

      // Create user provider
      await this.createUserProvider({
        userId: newUser.id,
        ...filterObjectBySchema(user, createUserProviderSchema)
      })

      // Emit user created to account service in order to create account
      this.accountService.emit('user_created', {
        userId: newUser.id,
        ...filterObjectBySchema(user, createAccountSchema)
      })
      return newUser

    } catch (error) {
        Logger.log('une erreur s\'est produite :', error?.message);
        throw new RpcException({
          message: error?.message ?? "Something went wrong",
          status: 500
        })
    }

  }

  async createUserProvider(userProvider: CreateUserProviderDto) {
    try {
      await this.primsa.userProvider.create({
        data: userProvider
      });
    } catch (error) {
        Logger.log('une erreur s\'est produite :', error?.message);
    }
  }
}
