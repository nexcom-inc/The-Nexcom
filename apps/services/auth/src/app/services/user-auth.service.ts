import {
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { compare } from 'bcryptjs';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs'; // Import firstValueFrom to convert Observable to Promise
import { USER_SERVICE } from '@the-nexcom/nest-common';
import { CreateUserDto, OauthUserDto } from '@the-nexcom/dto';
import { EmailAuthService } from './email-auth.service';


@Injectable()
export class UserAuthService {

  private readonly logger = new Logger(UserAuthService.name);

  constructor(
    @Inject(USER_SERVICE) private readonly userService: ClientProxy,
    private readonly emailAuthService : EmailAuthService
  ) {}

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
    this.emailAuthService.sendEmailConfirmationCode(user.email);
    return {message: "Un email de confirmation vous a ete envoye"}
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
}
