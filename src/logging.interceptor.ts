import { ExecutionContext, NestInterceptor } from '@nestjs/common';
import { CallHandler } from '@nestjs/internal';
import { Observable, tap } from 'rxjs';

export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    console.log('Before...');

    const now = Date.now();
    return next.handle().pipe(tap(() => console.log(`After... ${Date.now() - now}ms`)));
  }
}

export class LoggingInterceptor2 implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    console.log('Before2...');

    const now = Date.now();
    return next.handle().pipe(tap(() => console.log(`After2... ${Date.now() - now}ms`)));
  }
}
