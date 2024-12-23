import {
  ArgumentMetadata,
  ControllerComponentType,
  getMetadata,
  Pipe,
  PIPES,
  PipesProvider,
  PipeTransform,
} from '../internal';
import { BaseControllerComponent } from './base-controller-component';
import { IController } from './controller';

export interface GlobalPipesProvider {
  getGlobalPipes(): Pipe[];
}

export interface IPipeManager {
  transform(
    value: unknown,
    methodName: string | symbol,
    paramPipesProvider: PipesProvider,
  ): unknown;
}

export class PipeManager extends BaseControllerComponent<PipeTransform> implements IPipeManager {
  private readonly globalPipesProvider: GlobalPipesProvider;

  constructor(controller: IController, globalPipesProvider: GlobalPipesProvider) {
    super(controller);
    this.globalPipesProvider = globalPipesProvider;
  }

  transform(
    value: unknown,
    methodName: string | symbol,
    paramPipesProvider: PipesProvider,
  ): unknown {
    const paramPipeInstances = this.getPipeInstanceFromParam(paramPipesProvider);
    const metadata = this.getArgumentMetadata(paramPipesProvider);

    const transformFns = [...this.getComponentInstances(methodName), ...paramPipeInstances];

    return transformFns.reduce<unknown>((prev, instance) => {
      return instance.transform(prev, metadata);
    }, value);
  }

  protected override getComponentsFromGlobal(): ControllerComponentType<
    PipeTransform<unknown, unknown>
  >[] {
    return this.globalPipesProvider.getGlobalPipes();
  }
  protected override getComponentsFromController(): ControllerComponentType<
    PipeTransform<unknown, unknown>
  >[] {
    const controllerInstance = this.controller.getInstance();
    return getMetadata<Pipe[]>(PIPES, controllerInstance.constructor) ?? [];
  }
  protected override getComponentsFromMethod(
    methodName: string | symbol,
  ): ControllerComponentType<PipeTransform<unknown, unknown>>[] {
    const controllerInstance = this.controller.getInstance();
    return getMetadata<Pipe[]>(PIPES, controllerInstance, methodName) ?? [];
  }

  private getPipeInstanceFromParam(paramPipesProvider: PipesProvider) {
    const pipes = paramPipesProvider.getPipes();
    return pipes.map((pipe) => this.getInstance(pipe));
  }

  private getArgumentMetadata(paramPipesProvider: PipesProvider): ArgumentMetadata {
    return paramPipesProvider.getArgumentMetadata();
  }
}
