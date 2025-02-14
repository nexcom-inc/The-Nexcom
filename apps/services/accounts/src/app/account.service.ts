import { Injectable, Logger } from '@nestjs/common';
import { CreateAccountDto, UpdateAccountDto } from '@the-nexcom/dto';
import { PrismaService } from '@the-nexcom/nest-common';

@Injectable()
export class AccountService {
  private logger = new Logger(AccountService.name);

  constructor(
    private readonly prisma : PrismaService
  ) {}

  async createAccount(account: CreateAccountDto) {
    try {
      return await this.prisma.account.create({
        data: account
      })
    } catch (error) {
      this.logger.warn('une erreur s\'est produite :', error?.message);
      return
    }
  }

  async updateAccount(account: UpdateAccountDto) {
    try {
      return await this.prisma.account.update({
        where: {
          userId: account.userId
        },
        data: account
      })
    } catch (error) {
      this.logger.warn('une erreur s\'est produite :', error?.message);
      return
    }
  }
}
