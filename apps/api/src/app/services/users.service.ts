import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";

@Injectable()
export class UsersService {

  constructor(
    @Inject('USER_SERVICE') private readonly userService: ClientProxy
  ) {

  }

  async getMe (id : string) {
    return this.userService.send({ cmd: 'get-user-by-id' }, id)
  }
}
