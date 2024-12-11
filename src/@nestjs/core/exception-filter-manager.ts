import {
  type ArgumentsHost,
  BaseExceptionFilter,
  CATCH,
  ClassConstructor,
  ControllerComponentType,
  EXCEPTION_FILTERS,
  type ExceptionFilter,
  ExceptionFilterType,
  type ExceptionType,
  getMetadata,
} from '../internal';
import { BaseControllerComponent } from './base-controller-component';
import { IController } from './controller';
export interface IExceptionFilterManager {
  handlerException(exception: unknown, methodName: string | symbol, host: ArgumentsHost): void;
}

export interface GlobalFiltersProvider {
  getGlobalFilters(): ExceptionFilterType[];
}

interface ExceptionFilterObj {
  filterTypes: ExceptionType[];
  handler: ExceptionFilter['catch'];
}

export class ExceptionFilterManager
  extends BaseControllerComponent<ExceptionFilter>
  implements IExceptionFilterManager
{
  private static readonly baseExceptionFiler = new BaseExceptionFilter();

  private readonly globalFiltersProvider: GlobalFiltersProvider;

  constructor(globalFiltersProvider: GlobalFiltersProvider, controller: IController) {
    super(controller);
    this.globalFiltersProvider = globalFiltersProvider;
  }

  protected override getComponentsFromGlobal(): ControllerComponentType<ExceptionFilter>[] {
    return this.globalFiltersProvider.getGlobalFilters();
  }
  protected override getComponentsFromController(): ControllerComponentType<ExceptionFilter>[] {
    const controllerInstance = this.controller.getInstance();
    return (
      getMetadata<ExceptionFilterType[]>(EXCEPTION_FILTERS, controllerInstance.constructor) ?? []
    );
  }
  protected override getComponentsFromMethod(
    methodName: string | symbol,
  ): ControllerComponentType<ExceptionFilter>[] {
    return (
      getMetadata<ExceptionFilterType[]>(
        EXCEPTION_FILTERS,
        this.controller.getInstance(),
        methodName,
      ) ?? []
    );
  }

  private getFilterTypes(exceptionFilter: ExceptionFilter): ExceptionType[] {
    const cls = exceptionFilter.constructor as ClassConstructor<ExceptionFilter>;
    return getMetadata<ExceptionType[]>(CATCH, cls) ?? [];
  }

  private normalizeExceptionFilterObj(instance: ExceptionFilter): ExceptionFilterObj {
    return {
      filterTypes: this.getFilterTypes(instance),
      handler: instance.catch.bind(instance),
    };
  }

  handlerException(exception: unknown, methodName: string | symbol, host: ArgumentsHost): void {
    const componentInstances: ExceptionFilter[] = [
      ...this.getComponentInstances(methodName),
      ExceptionFilterManager.baseExceptionFiler,
    ];
    const filters = componentInstances.map((instance) =>
      this.normalizeExceptionFilterObj(instance),
    );
    const { handler } = filters.find((filter) => {
      const { filterTypes } = filter;
      return filterTypes.length === 0 || filterTypes.some((cls) => exception instanceof cls);
    })!;

    handler(exception, host);
  }
}
