import type { NextFunction, Request, Response } from 'express';
import type { HTTP_METHODS, RequestMethod } from './constant';
import { Observable } from 'rxjs';

export interface HttpMethodDescription<
  T extends (...args: unknown[]) => unknown = (...args: unknown[]) => unknown,
> {
  method: HTTP_METHODS;
  fn: T;
  path: string;
}

export type HttpRedirectionDescription = {
  url: string;
  statusCode?: number;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ClassConstructor<T = object> = new (...args: any[]) => T;

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
export type StaticImplements<I extends new (...args: any[]) => any, C extends I> = InstanceType<I>;

export type Provide = string | ClassConstructor | symbol;

export type InjectKey = {
  key: Provide;
  index: number;
};

export type ControllerCls = ClassConstructor;

export type ModuleCls = new () => object;

export type MiddlewareRouteObj = {
  path: string;
  method: RequestMethod;
};

export type MiddlewareRoutesOptions = string | ControllerCls | MiddlewareRouteObj;

export type ExcludeMiddlewareRoutesOptions = string | MiddlewareRouteObj;

export type MiddlewareFunction = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void> | void;

export interface NestMiddleware {
  use: MiddlewareFunction;
}

export type MiddlewareClass = ClassConstructor<NestMiddleware>;

export type Middleware = MiddlewareFunction | MiddlewareClass;

export interface MiddlewareProxy {
  forRoutes(...option: MiddlewareRoutesOptions[]): MiddlewareConsumer;
  exclude(...options: ExcludeMiddlewareRoutesOptions[]): this;
}

export interface MiddlewareConsumer {
  apply(...middlewares: Middleware[]): MiddlewareProxy;
}

export interface NestModule {
  configure(consumer: MiddlewareConsumer): void;
}

export type RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => void | Promise<void>;

export type MethodsHandler = (path: string, handler: RequestHandler) => void;

export interface IServer {
  use(path: string, ...middleware: MiddlewareFunction[]): void;
  get: MethodsHandler;
  post: MethodsHandler;
}

export interface HttpContext {
  getRequest(): Request;
  getResponse(): Response;
}

export interface ArgumentsHost {
  switchToHttp(): HttpContext;
}

export type ArgumentMetadataType = 'body' | 'query' | 'param' | 'custom';

export interface ArgumentMetadata {
  type: ArgumentMetadataType;
  metatype?: unknown;
  data?: string;
}

export interface PipeTransform<T = unknown, R = unknown> {
  transform(value: T, metadata: ArgumentMetadata): R;
}

export type ControllerComponentType<T extends object> = T | ClassConstructor<T>;

export type Pipe = ControllerComponentType<PipeTransform>;

export interface ExecutionContext extends ArgumentsHost {
  getHandler(): (...args: unknown[]) => unknown;
}

export interface CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean>;
}

export type Guard = ControllerComponentType<CanActivate>;

export interface CallHandler {
  handle<T>(): Observable<T>;
}

export interface NestInterceptor<T = unknown> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<T>;
}

export type Interceptor = ControllerComponentType<NestInterceptor>;
