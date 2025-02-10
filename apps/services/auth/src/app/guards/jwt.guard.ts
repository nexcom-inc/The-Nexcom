import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { AuthGuard } from '@nestjs/passport';


// This class is used  to validate the jwt token in rpc calls
@Injectable()
export class RcpJwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(RcpJwtAuthGuard.name);

  handleRequest(err, user, info, context) {
    this.logger.debug('JwtAuthGuard triggered');

    if (err) {
      this.logger.error(`Error: ${err.message}`);
      throw new RpcException({
        message: err.message,
        status: 401
      })
    }
    if (info) {
      this.logger.warn(`Info: ${info.message}`);
    }
    if (!user) {
      this.logger.warn('No user found');
      throw new RpcException({
        message: 'No user found',
        status: 401
      })
    }

    return super.handleRequest(err, user, info, context);
  }
}

