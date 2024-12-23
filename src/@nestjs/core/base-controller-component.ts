import { Cache, ClassConstructor, ControllerComponentType } from '../internal';
import { IController } from './controller';

export abstract class BaseControllerComponent<T extends object> {
  protected readonly controller: IController;

  constructor(controller: IController) {
    this.controller = controller;
  }

  protected abstract getComponentsFromGlobal(): ControllerComponentType<T>[];

  protected abstract getComponentsFromController(): ControllerComponentType<T>[];

  protected abstract getComponentsFromMethod(
    methodName: string | symbol,
  ): ControllerComponentType<T>[];

  protected mergeComponentInstances(
    globalComponentInstances: T[],
    controllerComponentInstances: T[],
    methodComponentInstances: T[],
  ): T[] {
    return [
      ...globalComponentInstances,
      ...controllerComponentInstances,
      ...methodComponentInstances,
    ];
  }

  private isClass(component: ControllerComponentType<T>): component is ClassConstructor<T> {
    return typeof component === 'function';
  }

  @Cache()
  private buildClass(cls: ClassConstructor<T>, injectable: boolean) {
    if (injectable) {
      const module = this.controller.getModule();
      const classBuilder = module.getClassBuilder();

      return classBuilder.buildClass(cls);
    }
    return new cls();
  }

  protected getInstance(component: ControllerComponentType<T>, injectable: boolean = true): T {
    if (this.isClass(component)) {
      return this.buildClass(component, injectable);
    }

    return component;
  }

  private getGlobalComponentInstances(): T[] {
    const components = this.getComponentsFromGlobal();
    return components.map((component) => this.getInstance(component, false));
  }

  private getControllerComponentInstances(): T[] {
    const components = this.getComponentsFromController();
    return components.map((component) => this.getInstance(component));
  }

  private getMethodComponentInstances(methodName: string | symbol): T[] {
    const components = this.getComponentsFromMethod(methodName);
    return components.map((component) => this.getInstance(component));
  }

  protected getComponentInstances(methodName: string | symbol): T[] {
    const globalComponentInstances = this.getGlobalComponentInstances();
    const controllerComponentInstances = this.getControllerComponentInstances();
    const methodComponentInstances = this.getMethodComponentInstances(methodName);

    return this.mergeComponentInstances(
      globalComponentInstances,
      controllerComponentInstances,
      methodComponentInstances,
    );
  }
}
