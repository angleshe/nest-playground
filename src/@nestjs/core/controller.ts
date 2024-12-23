import { NextFunction, Request, Response } from 'express';
import {
  ArgumentsHost,
  BaseParamsDecorator,
  CONTROLLER_METHODS,
  ControllerCls,
  ExecutionContext,
  getMetadata,
  HTTP_CODE,
  HTTP_HEADER,
  HTTP_METHOD,
  HTTP_METHODS,
  HTTP_PARAM,
  HTTP_PATH_PREFIX,
  HTTP_REDIRECT,
  HttpMethodDescription,
  HttpRedirectionDescription,
  IServer,
} from '../internal';
import {
  ExceptionFilterManager,
  GlobalFiltersProvider,
  IExceptionFilterManager,
} from './exception-filter-manager';
import { Logger } from './logger';
import { IModule } from './module';
import Path from 'node:path';
import { IPipeManager } from './pipe-manager';
import { IGuardManager } from './guard-manager';
import { IInterceptorManager } from './interceptor-manager';

export interface IController {
  getModule(): IModule;
  resolveControllers(app: IServer, globalFiltersProvider: GlobalFiltersProvider): void;
  getInstance(): object;
  setPipeManager(pipeManager: IPipeManager): void;
  setGuardManager(guardManager: IGuardManager): void;
  setInterceptorManager(interceptorManager: IInterceptorManager): void;
}

interface RequestHandlerContext {
  paramDescriptions: BaseParamsDecorator[];
  req: Request;
  res: Response;
  next: NextFunction;
  methodName: string | symbol;
  method: HTTP_METHODS;
  handler: (...args: unknown[]) => unknown;
}

export class Controller implements IController {
  private readonly cls: ControllerCls;

  private readonly instance: object;

  private readonly module: IModule;

  private guardManager: IGuardManager | null = null;

  private pipeManager: IPipeManager | null = null;

  private interceptorManager: IInterceptorManager | null = null;

  constructor(cls: ControllerCls, module: IModule) {
    this.cls = cls;
    this.module = module;
    this.instance = this.getControllerInstance();
  }
  setGuardManager(guardManager: IGuardManager): void {
    this.guardManager = guardManager;
  }

  setPipeManager(pipeManager: IPipeManager): void {
    this.pipeManager = pipeManager;
  }

  setInterceptorManager(interceptorManager: IInterceptorManager): void {
    this.interceptorManager = interceptorManager;
  }

  getInstance(): object {
    return this.instance;
  }

  private getControllerInstance(): object {
    const classBuilder = this.module.getClassBuilder();
    return classBuilder.buildClass(this.cls);
  }

  getModule(): IModule {
    return this.module;
  }

  private getArgumentsHost(context: RequestHandlerContext): ArgumentsHost {
    const { req, res } = context;
    return {
      switchToHttp() {
        return {
          getRequest() {
            return req;
          },
          getResponse() {
            return res;
          },
        };
      },
    };
  }

  private getExecutionContext(context: RequestHandlerContext): ExecutionContext {
    return {
      ...this.getArgumentsHost(context),
      getHandler() {
        return context.handler;
      },
    };
  }

  private parseControllerParam(context: RequestHandlerContext): unknown[] {
    const { req, res, next, paramDescriptions, methodName } = context;
    return paramDescriptions.reduce<unknown[]>((params, paramDecoratorInstance) => {
      const index = paramDecoratorInstance.getParamsIndex();
      const param = paramDecoratorInstance.resolveParams({
        executionContext: this.getArgumentsHost(context),
        next,
        req,
        res,
      });

      params[index] =
        paramDecoratorInstance.isSupperPipe && this.pipeManager
          ? this.pipeManager.transform(param, methodName, paramDecoratorInstance)
          : param;
      return params;
    }, []);
  }

  private async callControllerMethod(
    fn: HttpMethodDescription['fn'],
    context: RequestHandlerContext,
  ): Promise<unknown> {
    const content = await Reflect.apply(fn, this.instance, this.parseControllerParam(context));
    return content;
  }

  private checkSendRes(paramDescriptions: BaseParamsDecorator[]): boolean {
    return paramDescriptions.every((paramDecoratorInstance) => {
      return paramDecoratorInstance.checkSendRes();
    });
  }

  private isRedirectResult(res: unknown): res is HttpRedirectionDescription {
    return !!(res as { url?: string })?.url;
  }

  private redirect(res: Response, { url, statusCode }: HttpRedirectionDescription) {
    return statusCode === undefined ? res.redirect(url) : res.redirect(statusCode, url);
  }

  private resolveResult(result: unknown, context: RequestHandlerContext) {
    const { paramDescriptions, res, methodName, method } = context;
    if (this.checkSendRes(paramDescriptions)) {
      if (this.isRedirectResult(result)) return this.redirect(res, result);

      const redirectionDesc = getMetadata<HttpRedirectionDescription>(
        HTTP_REDIRECT,
        this.instance,
        methodName,
      );
      if (redirectionDesc) return this.redirect(res, redirectionDesc);

      const code =
        getMetadata<number>(HTTP_CODE, this.instance, methodName) ??
        (method === HTTP_METHODS.POST ? 201 : 200);
      const headersObj =
        getMetadata<Record<string, string>>(HTTP_HEADER, this.instance, methodName) ?? {};
      const header = new Headers(headersObj);
      res.setHeaders(header).status(code).send(result);
    }
  }

  resolveControllers(app: IServer, globalFiltersProvider: GlobalFiltersProvider): void {
    const exceptionFilterManager: IExceptionFilterManager = new ExceptionFilterManager(
      globalFiltersProvider,
      this,
    );
    const prefixPath = getMetadata<string>(HTTP_PATH_PREFIX, this.cls) ?? '/';
    Logger.log(`AppController {${prefixPath}}:`, 'RoutesResolver');
    const methodNames = getMetadata<(symbol | string)[]>(CONTROLLER_METHODS, this.instance) ?? [];
    for (const methodName of methodNames) {
      const methodDescription = getMetadata<HttpMethodDescription>(
        HTTP_METHOD,
        this.instance,
        methodName,
      );
      if (methodDescription) {
        const { fn, path, method } = methodDescription;
        const fullPath = Path.posix.join('/', prefixPath, path);
        app[method](fullPath, async (req, res, next) => {
          const paramDescriptions =
            getMetadata<BaseParamsDecorator[]>(HTTP_PARAM, this.instance, methodName) ?? [];
          const context: RequestHandlerContext = {
            req,
            res,
            next,
            paramDescriptions,
            method,
            methodName,
            handler: fn,
          };
          try {
            await this.guardManager?.execGuard(methodName, this.getExecutionContext(context));
            await this.interceptorManager?.intercept(
              methodName,
              this.getExecutionContext(context),
              async () => {
                const content = await this.callControllerMethod(fn, context);
                this.resolveResult(content, context);
              },
            );
          } catch (e) {
            exceptionFilterManager.handlerException(e, methodName, this.getArgumentsHost(context));
          }
        });
        Logger.log(`Mapped {${fullPath}, ${method.toUpperCase()}} route`, 'RoutesResolver');
      }
    }
  }
}
