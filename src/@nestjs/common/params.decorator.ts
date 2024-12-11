import {
  BodyDecorator,
  CustomDecorator,
  getParamTypeMeta,
  HeadersDecorator,
  HostParamDecorator,
  HTTP_PARAM,
  IpDecorator,
  NextDecorator,
  ParamDecorator,
  QueryDecorator,
  RequestDecorator,
  ResponseDecorator,
  safeGetMetadata,
  SessionDecorator,
} from '../internal';
import type {
  BaseParamsDecorator,
  CustomParamDecoratorHandler,
  ArgumentsHost,
  ResponseOptions,
  Pipe,
} from '../internal';
type ParamDecoratorType<T extends unknown[]> = (...args: T) => ParameterDecorator;

export { ArgumentsHost };

function registerParamDecorator<T extends unknown[] = []>(
  getDecoratorInstance: (
    paramIndex: number,
    args: T,
    metatype: unknown | undefined,
  ) => BaseParamsDecorator,
): ParamDecoratorType<T> {
  return (...args: T) => {
    return (target, propertyKey, index) => {
      const paramDescriptions = safeGetMetadata<BaseParamsDecorator[]>(
        HTTP_PARAM,
        [],
        target,
        propertyKey,
      );

      const paramTypes = getParamTypeMeta(target, propertyKey);

      paramDescriptions.push(getDecoratorInstance(index, args, paramTypes?.[index]));
    };
  };
}

export function createParamDecorator<T extends unknown[] = [], HR = unknown>(
  handler: CustomParamDecoratorHandler<T[0], HR>,
): ParamDecoratorType<T>;

export function createParamDecorator<T = unknown, HR = unknown>(
  handler: CustomParamDecoratorHandler<T | undefined, HR>,
): ParamDecoratorType<[T] | []> {
  return registerParamDecorator<[T] | []>(
    (index, args, metatype) => new CustomDecorator({ index, args, handler, metatype }),
  );
}

export const Req = registerParamDecorator((index) => new RequestDecorator({ index }));
export const Request = registerParamDecorator((index) => new RequestDecorator({ index }));
export const Res = registerParamDecorator<[ResponseOptions] | []>(
  (index, args) => new ResponseDecorator({ index, passthrough: args[0]?.passthrough }),
);
export const Response = registerParamDecorator<[ResponseOptions] | []>(
  (index, args) => new ResponseDecorator({ index, passthrough: args[0]?.passthrough }),
);
export const Next = registerParamDecorator<[ResponseOptions] | []>(
  (index) => new NextDecorator({ index }),
);
export const Session = registerParamDecorator(
  (index, args) => new SessionDecorator({ index, args }),
);
export const Param = registerParamDecorator<[string, ...Pipe[]] | Pipe[]>(
  (index, args, metatype) => new ParamDecorator({ index, args, metatype }),
);
export const Body = registerParamDecorator<[string] | []>(
  (index, args, metatype) => new BodyDecorator({ index, args, metatype }),
);
export const Query = registerParamDecorator<[string] | []>(
  (index, args, metatype) => new QueryDecorator({ index, args, metatype }),
);
export const Headers = registerParamDecorator<[string] | []>(
  (index, args) => new HeadersDecorator({ index, args }),
);
export const Ip = registerParamDecorator((index, args) => new IpDecorator({ index, args }));
export const HostParam = registerParamDecorator(
  (index, args) => new HostParamDecorator({ index, args }),
);
