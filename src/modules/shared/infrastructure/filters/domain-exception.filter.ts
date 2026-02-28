import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import {
  BusinessRuleViolationException,
  DomainException,
  EntityInactiveException,
  EntityNotFoundException,
} from '../../domain/exceptions/domain.exceptions';

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('DomainException');

  catch(exception: DomainException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = this.getHttpStatus(exception);

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: [exception.message],
    };

    this.logger.error(`${request.method} ${request.url} ${status} - Message: ${exception.message}`);

    response.status(status).json(errorResponse);
  }

  private getHttpStatus(exception: DomainException): number {
    if (exception instanceof EntityNotFoundException) return HttpStatus.NOT_FOUND;
    if (exception instanceof EntityInactiveException) return HttpStatus.GONE;
    if (exception instanceof BusinessRuleViolationException) return HttpStatus.BAD_REQUEST;
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }
}
