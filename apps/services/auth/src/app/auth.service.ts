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
import { UserJwt } from '@the-nexcom/nest-common';

@Injectable()
export class AuthService {
  constructor(
    @Inject('USER_SERVICE') private readonly userService: ClientProxy,
    private readonly jwtService: JwtService,
  ) {}

  async verifyToken(jwt: string) : Promise<{exp:number}> {
    if (!jwt) {

      console.log("no jwt");

      throw new UnauthorizedException();
    }
    try {

      console.log("jwt", jwt);


      const { exp } =await this.jwtService.verifyAsync(jwt);

      console.log("exp", exp);


      return { exp };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {

      console.log("error", error);

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


  async validateUser(email: string, password: string) {
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
    const access_token = this.jwtService.sign({ userId }, { expiresIn: '15m' });
    const refresh_token = this.jwtService.sign({ userId }, { expiresIn: '7d' });

    const payload = {
        access_token,
        refresh_token
    }

    return payload
  }

  async login(user: LoginUserDto) {
    const { email, password } = user;

    const existingUser = await this.validateUser(email, password);

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
}
