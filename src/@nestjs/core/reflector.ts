import { defineMetadata, getMetadata } from '@nestjs/internal';

export class Reflector {
  static createDecorator<T>(): (param: T) => ClassDecorator & MethodDecorator {
    const decorator = (param: T) =>
      ((
        target: object,
        propertyKey?: string | symbol,
        descriptor?: TypedPropertyDescriptor<unknown>,
      ) => {
        defineMetadata<T>(decorator, param, descriptor?.value ?? target);
      }) as ClassDecorator & MethodDecorator;

    return decorator;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get<R>(key: (...args: any[]) => unknown, target: object) {
    return getMetadata<R>(key, target);
  }
}
