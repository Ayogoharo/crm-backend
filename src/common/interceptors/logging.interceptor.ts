import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

interface ErrorWithStatus extends Error {
  status?: number;
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<AuthenticatedRequest>();
    const response = httpContext.getResponse<Response>();

    const startTime = Date.now();
    const { method, url, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const clientIp = request.ip || request.connection?.remoteAddress;

    // Log incoming request
    this.logger.log({
      message: 'Incoming request',
      method,
      url,
      userAgent,
      clientIp,
      userId: request.user?.id || null,
      timestamp: new Date().toISOString(),
    });

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        const { statusCode } = response;

        // Log successful response
        this.logger.log({
          message: 'Request completed',
          method,
          url,
          statusCode,
          duration: `${duration}ms`,
          userId: request.user?.id || null,
          timestamp: new Date().toISOString(),
        });
      }),
      catchError((error: ErrorWithStatus) => {
        const duration = Date.now() - startTime;
        const statusCode = error.status || 500;

        // Log error response
        this.logger.error({
          message: 'Request failed',
          method,
          url,
          statusCode,
          duration: `${duration}ms`,
          error: error.message,
          userId: request.user?.id || null,
          timestamp: new Date().toISOString(),
        });

        return throwError(() => error);
      }),
    );
  }
}
