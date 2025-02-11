import {  Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { Providers } from '@prisma/client';
import { createAccountSchema, CreateUserDto, CreateUserProviderDto, createUserProviderSchema } from '@the-nexcom/dto';
import { PrismaService } from '@the-nexcom/nest-common';
import { filterObjectBySchema } from '@the-nexcom/utils';
import { hash } from 'bcryptjs';

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
        select: {
          id: true,
          email: true,
          password: true
        }
      });
    } catch (error) {
        Logger.log('une erreur s\'est produite :', error?.message);
        throw new RpcException({
          message: error?.message,
          status: 500
        })
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

      if (user.password){
        user.password = await hash(user.password, 10)
      }

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

  async UpdateUserProviders(userProviders: CreateUserProviderDto) {

    try {
        const existingProvider = await this.primsa.userProvider.findUnique({
            where: {
                userId_provider: {
                    userId: userProviders.userId,
                    provider: userProviders.provider as Providers
                }
            }
        })

        if (!existingProvider) {


            await this.createUserProvider(userProviders)
        }
    } catch (error) {
        Logger.error('une erreur s\'est produite :', error?.message);
    }
  }
}
