import {
  getMetadata,
  HTTP_PATH_PREFIX,
  isControllerClass,
  type MiddlewareClass,
  type MiddlewareFunction,
  RequestMethod,
  type ClassBuilder,
  type ExcludeMiddlewareRoutesOptions,
  type IServer,
  type Middleware,
  type MiddlewareConsumer,
  type MiddlewareRouteObj,
  type MiddlewareRoutesOptions,
  MiddlewareProxy,
} from '../internal';
import Path from 'node:path';

export class MiddlewareManager implements MiddlewareConsumer, MiddlewareProxy {
  private readonly classBuilder: ClassBuilder;

  private readonly app: IServer;

  private middlewares: MiddlewareFunction[] = [];

  private routeInfos: MiddlewareRouteObj[] = [];

  private excludeRouteInfos: MiddlewareRouteObj[] = [];

  constructor(app: IServer, classBuilder: ClassBuilder) {
    this.classBuilder = classBuilder;
    this.app = app;
  }

  private isMiddlewareClass(middleware: Middleware): middleware is MiddlewareClass {
    return !!(middleware as MiddlewareClass).prototype?.use;
  }

  private normalizeMiddlewareFunction(middleware: Middleware): MiddlewareFunction {
    if (this.isMiddlewareClass(middleware)) {
      const instance = this.classBuilder.buildClass(middleware);
      return instance.use.bind(instance);
    }
    return middleware;
  }

  apply(...middlewares: Middleware[]): this {
    this.middlewares = middlewares.map((middleware) =>
      this.normalizeMiddlewareFunction(middleware),
    );
    return this;
  }

  private normalizeRouteInfo(option: MiddlewareRoutesOptions): MiddlewareRouteObj {
    if (typeof option === 'string') {
      return {
        method: RequestMethod.ALL,
        path: option,
      };
    }

    if (isControllerClass(option)) {
      const prefix = getMetadata<string>(HTTP_PATH_PREFIX, option) ?? '/';
      return {
        method: RequestMethod.ALL,
        path: prefix,
      };
    }

    option.path = Path.posix.join('/', option.path);

    return option;
  }

  forRoutes(...options: MiddlewareRoutesOptions[]): this {
    this.routeInfos = options.map((option) => this.normalizeRouteInfo(option));
    this.use();
    return this;
  }

  exclude(...options: ExcludeMiddlewareRoutesOptions[]): this {
    options.forEach((option) => {
      this.excludeRouteInfos.push(this.normalizeRouteInfo(option));
    });
    return this;
  }

  private use(): void {
    const { routeInfos, excludeRouteInfos, middlewares } = this;

    if (middlewares.length) {
      routeInfos.forEach((routeInfo) => {
        const handlerFns = middlewares.map<MiddlewareFunction>((fn) => (req, res, next) => {
          const targetMethod = req.method.toLowerCase();
          if (routeInfo.method === RequestMethod.ALL || targetMethod === routeInfo.method) {
            if (
              excludeRouteInfos.every(({ method, path }) => {
                return !(
                  path === req.originalUrl &&
                  (method === RequestMethod.ALL || method === targetMethod)
                );
              })
            ) {
              return fn(req, res, next);
            }
          }
          return next();
        });
        this.app.use(routeInfo.path, ...handlerFns);
      });
    }
    this.clearData();
  }

  private clearData() {
    this.routeInfos = [];
    this.middlewares = [];
    this.excludeRouteInfos = [];
  }
}
