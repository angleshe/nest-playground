import { INTERCEPTOR, Interceptor, safeGetMetadata } from '../internal';

export function UseInterceptors(...interceptors: Interceptor[]): ClassDecorator & MethodDecorator {
  return ((target, propertyKey) => {
    const interceptorArr = safeGetMetadata<Interceptor[]>(INTERCEPTOR, [], target, propertyKey);
    interceptorArr.push(...interceptors);
  }) as ClassDecorator & MethodDecorator;
}
