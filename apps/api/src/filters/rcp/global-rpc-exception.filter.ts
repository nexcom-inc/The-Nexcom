import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Response } from 'express';

@Catch(RpcException)
export class GlobalRpcExceptionFilter implements ExceptionFilter {
  catch(exception: RpcException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Extraire le détail de l'erreur RPC
    const error = exception.getError();
    const statusCode = error['statusCode'] || 500;
    const message = error['message'] || 'Internal Server Error';

    // Envoyer une réponse HTTP standardisée
    response.status(statusCode).json({
      statusCode,
      message,
    });
  }
}
