import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Inject } from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(@Inject('testStr') private readonly msg: string) {
    console.log('msg======>', this.msg);
  }
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = exception.getStatus();

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      testStr: this.msg,
    });
  }
}
