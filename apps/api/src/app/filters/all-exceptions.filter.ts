import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    // Log the full stack trace for debugging, except for 404 Not Found to reduce noise
    if (exception instanceof Error) {
      if (status === HttpStatus.NOT_FOUND) {
        this.logger.warn(
          `[${request.method}] ${request.url} - ${exception.message}`,
        );
      } else {
        this.logger.error(
          `[${request.method}] ${request.url} - ${exception.message}`,
          exception.stack,
        );
        console.error('--- Stack Trace ---');
        console.error(exception);
        console.error('-------------------');
      }
    } else {
      if (status === HttpStatus.NOT_FOUND) {
        this.logger.warn(`[${request.method}] ${request.url} - ${exception}`);
      } else {
        this.logger.error(`[${request.method}] ${request.url} - ${exception}`);
      }
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: message,
    });
  }
}
