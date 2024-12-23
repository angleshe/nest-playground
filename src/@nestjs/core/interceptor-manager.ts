import { Observable, from } from 'rxjs';
import {
  CallHandler,
  ControllerComponentType,
  ExecutionContext,
  getMetadata,
  INTERCEPTOR,
  Interceptor,
  NestInterceptor,
} from '../internal';
import { BaseControllerComponent } from './base-controller-component';
import { IController } from './controller';

export interface IInterceptorManager {
  intercept(
    methodName: string | symbol,
    context: ExecutionContext,
    handle: () => Promise<void>,
  ): Promise<void>;
}

export interface GlobalInterceptorProvider {
  getGlobalInterceptor(): Interceptor[];
}

export class InterceptorManager
  extends BaseControllerComponent<NestInterceptor>
  implements IInterceptorManager
{
  private readonly globalInterceptorProvider: GlobalInterceptorProvider;

  constructor(controller: IController, globalInterceptorProvider: GlobalInterceptorProvider) {
    super(controller);
    this.globalInterceptorProvider = globalInterceptorProvider;
  }

  protected override getComponentsFromGlobal(): ControllerComponentType<
    NestInterceptor<unknown>
  >[] {
    return this.globalInterceptorProvider.getGlobalInterceptor();
  }
  protected override getComponentsFromController(): ControllerComponentType<
    NestInterceptor<unknown>
  >[] {
    const controllerInstance = this.controller.getInstance();

    return getMetadata<Interceptor[]>(INTERCEPTOR, controllerInstance.constructor) ?? [];
  }
  protected override getComponentsFromMethod(
    methodName: string | symbol,
  ): ControllerComponentType<NestInterceptor<unknown>>[] {
    const controllerInstance = this.controller.getInstance();
    return getMetadata<Interceptor[]>(INTERCEPTOR, controllerInstance, methodName) ?? [];
  }

  intercept(
    methodName: string | symbol,
    context: ExecutionContext,
    handle: () => Promise<void>,
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const interceptorInstances = this.getComponentInstances(methodName);
      const interceptorCallHandler = new InterceptorCallHandler(
        interceptorInstances,
        handle,
        context,
      );
      interceptorCallHandler.handle().subscribe({
        next: () => resolve(),
        error: reject,
      });
    });
  }
}

class InterceptorCallHandler implements CallHandler {
  private readonly interceptorInstances: NestInterceptor[] = [];

  private readonly context: ExecutionContext;

  private readonly routeHandle: () => Promise<void>;

  private index: number = 0;

  constructor(
    interceptorInstances: NestInterceptor[],
    routeHandle: () => Promise<void>,
    context: ExecutionContext,
  ) {
    this.interceptorInstances = interceptorInstances;
    this.routeHandle = routeHandle;
    this.context = context;
  }

  private execIntercept<T>(i: number) {
    if (i === this.interceptorInstances.length) {
      return from(this.routeHandle()) as Observable<T>;
    }

    return this.interceptorInstances[i].intercept(this.context, this) as Observable<T>;
  }

  handle<T>(): Observable<T> {
    return this.execIntercept<T>(this.index++);
  }
}
