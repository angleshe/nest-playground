import { Observable } from 'rxjs';
import {
  CanActivate,
  ControllerComponentType,
  ExecutionContext,
  getMetadata,
  Guard,
  GUARDS,
  HttpException,
  HttpStatus,
} from '../internal';
import { BaseControllerComponent } from './base-controller-component';
import { IController } from './controller';

export interface IGuardManager {
  execGuard(methodName: string | symbol, context: ExecutionContext): Promise<void>;
}

export interface GlobalGuardProvider {
  getGlobalGuardProvider(): Guard[];
}

export class GuardManager extends BaseControllerComponent<CanActivate> implements IGuardManager {
  private readonly globalGuardProvider: GlobalGuardProvider;

  constructor(controller: IController, globalGuardProvider: GlobalGuardProvider) {
    super(controller);
    this.globalGuardProvider = globalGuardProvider;
  }

  protected override getComponentsFromGlobal(): ControllerComponentType<CanActivate>[] {
    return this.globalGuardProvider.getGlobalGuardProvider();
  }
  protected override getComponentsFromController(): ControllerComponentType<CanActivate>[] {
    const controllerCls = this.controller.getInstance().constructor;
    return getMetadata<ControllerComponentType<CanActivate>[]>(GUARDS, controllerCls) ?? [];
  }
  protected override getComponentsFromMethod(
    methodName: string | symbol,
  ): ControllerComponentType<CanActivate>[] {
    return (
      getMetadata<ControllerComponentType<CanActivate>[]>(
        GUARDS,
        this.controller.getInstance(),
        methodName,
      ) ?? []
    );
  }

  private checkGuard(guard: CanActivate, context: ExecutionContext): Promise<boolean> | boolean {
    const res = guard.canActivate(context);
    if (res instanceof Observable) {
      return new Promise<boolean>((resolve, reject) => {
        res.subscribe({
          next: resolve,
          error: reject,
        });
      });
    }
    return res;
  }

  async execGuard(methodName: string | symbol, context: ExecutionContext): Promise<void> {
    const instances = this.getComponentInstances(methodName);

    for (const guard of instances) {
      if (!(await this.checkGuard(guard, context))) {
        throw new HttpException('Forbidden resource', HttpStatus.FORBIDDEN);
      }
    }
  }
}
