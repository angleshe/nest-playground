import {
  CATCH,
  EXCEPTION_FILTERS,
  ExceptionFilterType,
  safeGetMetadata,
  type ExceptionType,
} from '../internal';
export function Catch(...types: ExceptionType[]): ClassDecorator {
  return (target) => {
    const exceptionTypes = safeGetMetadata<ExceptionType[]>(CATCH, [], target);
    exceptionTypes.push(...types);
  };
}

export function UseFilters(...filters: ExceptionFilterType[]): ClassDecorator & MethodDecorator {
  return ((target, propertyKey) => {
    const filterArr = safeGetMetadata<ExceptionFilterType[]>(
      EXCEPTION_FILTERS,
      [],
      target,
      propertyKey,
    );
    filterArr.push(...filters);
  }) as ClassDecorator & MethodDecorator;
}
