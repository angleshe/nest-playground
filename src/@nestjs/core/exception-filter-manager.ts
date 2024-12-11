import {
  type ArgumentsHost,
  BaseExceptionFilter,
  CATCH,
  ClassConstructor,
  EXCEPTION_FILTERS,
  type ExceptionFilter,
  ExceptionFilterType,
  type ExceptionType,
  getMetadata,
} from '../internal';
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

export class ExceptionFilterManager implements IExceptionFilterManager {
  private static readonly baseExceptionFiler = new BaseExceptionFilter();

  private readonly controller: IController;

  private readonly globalFiltersProvider: GlobalFiltersProvider;

  constructor(globalFiltersProvider: GlobalFiltersProvider, controller: IController) {
    this.globalFiltersProvider = globalFiltersProvider;
    this.controller = controller;
  }

  private getMethodFilters(methodName: string | symbol): ExceptionFilterObj[] {
    const filters =
      getMetadata<ExceptionFilterType[]>(
        EXCEPTION_FILTERS,
        this.controller.getInstance(),
        methodName,
      ) ?? [];
    return filters.map((filter) => this.normalizeExceptionFilterObj(filter));
  }

  private getControllerFilters(): ExceptionFilterObj[] {
    const controllerInstance = this.controller.getInstance();
    const filters =
      getMetadata<ExceptionFilterType[]>(EXCEPTION_FILTERS, controllerInstance.constructor) ?? [];
    return filters.map((filter) => this.normalizeExceptionFilterObj(filter));
  }

  private getGlobalFilters(): ExceptionFilterObj[] {
    const filters = this.globalFiltersProvider.getGlobalFilters();
    return filters.map((filter) => this.normalizeExceptionFilterObj(filter, false));
  }

  private getExceptionFilterInstance(exceptionFilter: ExceptionFilterType, injectable: boolean) {
    let instance: ExceptionFilter;
    if (typeof exceptionFilter === 'function') {
      if (injectable) {
        const module = this.controller.getModule();
        const classBuilder = module.getClassBuilder();
        instance = classBuilder.buildClass(exceptionFilter);
      } else {
        instance = new exceptionFilter();
      }
    } else {
      instance = exceptionFilter;
    }
    return instance;
  }

  private getFilterTypes(exceptionFilter: ExceptionFilterType): ExceptionType[] {
    const cls =
      typeof exceptionFilter === 'function'
        ? exceptionFilter
        : (exceptionFilter.constructor as ClassConstructor<ExceptionFilter>);

    return getMetadata<ExceptionType[]>(CATCH, cls) ?? [];
  }

  private normalizeExceptionFilterObj(
    exceptionFilter: ExceptionFilterType,
    injectable: boolean = true,
  ): ExceptionFilterObj {
    const instance = this.getExceptionFilterInstance(exceptionFilter, injectable);
    return {
      filterTypes: this.getFilterTypes(exceptionFilter),
      handler: instance.catch.bind(instance),
    };
  }

  handlerException(exception: unknown, methodName: string | symbol, host: ArgumentsHost): void {
    const methodFilters = this.getMethodFilters(methodName);
    const controllerFilters = this.getControllerFilters();
    const globalFilters = this.getGlobalFilters();
    const defaultFilters = this.normalizeExceptionFilterObj(
      ExceptionFilterManager.baseExceptionFiler,
      false,
    );

    const filters = [...methodFilters, ...controllerFilters, ...globalFilters, defaultFilters];

    const { handler } = filters.find((filter) => {
      const { filterTypes } = filter;
      return filterTypes.length === 0 || filterTypes.some((cls) => exception instanceof cls);
    })!;

    handler(exception, host);
  }
}
