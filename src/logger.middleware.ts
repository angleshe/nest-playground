import { Inject, type NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

export class LoggerMiddleware implements NestMiddleware {
  constructor(@Inject('testStr') private readonly testStr: string) {}
  use(req: Request, res: Response, next: NextFunction) {
    console.log('Request...', this.testStr);
    next();
  }
}
