import { Injectable } from '@nestjs/common';
import { CreateAccountDto, UpdateAccountDto } from '@the-nexcom/dto';
import { PrismaService } from '@the-nexcom/nest-common';

@Injectable()
export class AccountService {

  constructor(
    private readonly prisma : PrismaService
  ) {}

  async createAccount(account: CreateAccountDto) {
    return await this.prisma.account.create({
      data: account
    })
  }

  async updateAccount(account: UpdateAccountDto) {
    return await this.prisma.account.update({
      where: {
        userId: account.userId
      },
      data: account
    })
  }
}
