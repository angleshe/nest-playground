import { safeGetMetadata } from './metadata-helper';

const CacheKey = Symbol('cache');
export function Cache(genKey: (...args: unknown[]) => unknown = (key) => key): MethodDecorator {
  return (target, propertyKey, descriptor) => {
    const originFn = descriptor.value as (...args: unknown[]) => unknown;
    const cacheMap = safeGetMetadata(CacheKey, new Map<unknown, unknown>(), target, propertyKey);

    (descriptor.value as (...args: unknown[]) => unknown) = function (...args: unknown[]) {
      const key = genKey(...args);
      if (cacheMap.has(key)) {
        return cacheMap.get(key);
      }

      const res = Reflect.apply(originFn, this, args);

      cacheMap.set(key, res);

      return res;
    };
  };
}
