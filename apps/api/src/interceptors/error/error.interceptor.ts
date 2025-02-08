import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { catchError, Observable, throwError } from 'rxjs';

function doException(err: any) {
  try {
    if (err.status === 'error') {
      return new HttpException(
        {
          statusCode: HttpStatus.BAD_GATEWAY,
          message: "Something went wrong",
        },
        HttpStatus.BAD_GATEWAY,
      );
    } else {
      // Extraire les informations pertinentes de l'erreur
      const statusCode = err.status || HttpStatus.BAD_REQUEST;
      const message = err.message || "Bad Request";
      const details = err.response || {};

      return new HttpException(
        {
          statusCode,
          message,
          details,
        },
        statusCode,
      );
    }
  } catch {
    return new HttpException(
      {
        statusCode: HttpStatus.BAD_GATEWAY,
        message: "Something went wrong",
      },
      HttpStatus.BAD_GATEWAY,
    );
  }
}


@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError(err => {
          return throwError(() => doException(err));
      })
  );
  }
}
