import type { Pipe, ArgumentsHost } from '../../type';
export const PARAM_KEY = {
  REQUEST: Symbol('request'),
  RESPONSE: Symbol('response'),
  NEXT: Symbol('next'),
  SESSION: Symbol('session'),
  PARAM: Symbol('param'),
  BODY: Symbol('body'),
  QUERY: Symbol('query'),
  HEADERS: Symbol('headers'),
  IP: Symbol('ip'),
  HOST_PARAM: Symbol('hostParam'),
  CUSTOM: Symbol('custom'),
} satisfies Record<string, symbol>;

export type PARAM_KEY = (typeof PARAM_KEY)[keyof typeof PARAM_KEY];

export type CustomParamDecoratorHandler<D, R> = (data: D, context: ArgumentsHost) => R;

export interface ParamDecoratorMeta {
  index: number;
  metatype?: unknown | undefined;
}

export interface RequestProPertyParamDecoratorMeta extends ParamDecoratorMeta {
  args: [string, ...Pipe[]] | Pipe[];
}

export interface CustomParamDecoratorMeta<T = unknown, R = unknown> extends ParamDecoratorMeta {
  args: [T] | [];
  handler: CustomParamDecoratorHandler<T | undefined, R>;
}

export interface ResponseOptions {
  passthrough: boolean;
}

export interface ResponseParamDecoratorMeta extends ParamDecoratorMeta, Partial<ResponseOptions> {}
