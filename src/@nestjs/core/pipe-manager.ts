import {
  ArgumentMetadata,
  ClassConstructor,
  getMetadata,
  Pipe,
  PIPES,
  PipesProvider,
  PipeTransform,
} from '../internal';
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

export class PipeManager implements IPipeManager {
  private readonly controller: IController;
  private readonly globalPipesProvider: GlobalPipesProvider;

  constructor(controller: IController, globalPipesProvider: GlobalPipesProvider) {
    this.controller = controller;
    this.globalPipesProvider = globalPipesProvider;
  }

  transform(
    value: unknown,
    methodName: string | symbol,
    paramPipesProvider: PipesProvider,
  ): unknown {
    const globalTransformFns = this.getTransformFromGlobal();
    const controllerTransformFns = this.getTransformFromController();
    const methodTransformFns = this.getTransformFromMethod(methodName);
    const paramTransformFns = this.getTransformFromParams(paramPipesProvider);
    const metadata = this.getArgumentMetadata(paramPipesProvider);

    const transformFns = [
      ...globalTransformFns,
      ...controllerTransformFns,
      ...methodTransformFns,
      ...paramTransformFns,
    ];

    return transformFns.reduce<unknown>((prev, fn) => fn(prev, metadata), value);
  }

  private getArgumentMetadata(paramPipesProvider: PipesProvider): ArgumentMetadata {
    return paramPipesProvider.getArgumentMetadata();
  }

  private getTransformFromParams(paramPipesProvider: PipesProvider): PipeTransform['transform'][] {
    const pipes = paramPipesProvider.getPipes();
    return pipes.map((pipe) => this.pipeToTransformFn(pipe));
  }

  private getTransformFromMethod(methodName: string | symbol): PipeTransform['transform'][] {
    const controllerInstance = this.controller.getInstance();
    const pipes = getMetadata<Pipe[]>(PIPES, controllerInstance, methodName) ?? [];
    return pipes.map((pipe) => this.pipeToTransformFn(pipe));
  }
  private getTransformFromController(): PipeTransform['transform'][] {
    const controllerInstance = this.controller.getInstance();
    const pipes = getMetadata<Pipe[]>(PIPES, controllerInstance.constructor) ?? [];
    return pipes.map((pipe) => this.pipeToTransformFn(pipe));
  }

  private getTransformFromGlobal(): PipeTransform['transform'][] {
    const pipes = this.globalPipesProvider.getGlobalPipes();
    return pipes.map((pipe) => this.pipeToTransformFn(pipe, false));
  }

  private isPipeTransformClass(pipe: Pipe): pipe is ClassConstructor<PipeTransform> {
    return typeof pipe === 'function';
  }

  private getPipeInstance(
    pipeCls: ClassConstructor<PipeTransform>,
    injectable: boolean,
  ): PipeTransform {
    if (injectable) {
      const module = this.controller.getModule();
      const classBuilder = module.getClassBuilder();
      return classBuilder.buildClass(pipeCls);
    }
    return new pipeCls();
  }

  private pipeToTransformFn(pipe: Pipe, injectable: boolean = true): PipeTransform['transform'] {
    const pipeInstance = this.isPipeTransformClass(pipe)
      ? this.getPipeInstance(pipe, injectable)
      : pipe;
    return pipeInstance.transform.bind(pipeInstance);
  }
}
