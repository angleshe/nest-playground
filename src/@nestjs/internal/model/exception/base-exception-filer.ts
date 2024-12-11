import type { ArgumentsHost } from '../../type';
import type { ExceptionFilter } from './type';
import { HttpException } from './http-exception';
import { HttpStatus } from '../../constant';

export class BaseExceptionFilter implements ExceptionFilter {
  private isHttpException(exception: unknown): exception is HttpException {
    return exception instanceof HttpException;
  }
  catch(exception: unknown, host: ArgumentsHost): void {
    const res = host.switchToHttp().getResponse();
    const context = this.isHttpException(exception)
      ? {
          statusCode: exception.getStatus(),
          message: exception.getResponse(),
        }
      : {
          statusCode: HttpStatus.INTERNAL,
          message: 'Internal server error',
        };
    res.status(context.statusCode).send(context);
  }
}
