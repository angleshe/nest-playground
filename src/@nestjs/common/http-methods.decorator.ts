import 'reflect-metadata';
import {
  HTTP_METHOD as HTTP_METHOD_KEY,
  HTTP_PATH_PREFIX,
  CONTROLLER_METHODS,
  HTTP_METHODS,
  HTTP_CODE,
  HTTP_HEADER,
  HTTP_REDIRECT,
  defineMetadata,
  IS_CONTROLLER,
} from '../internal';
import type { HttpMethodDescription, HttpRedirectionDescription } from '../internal';

export interface ControllerOptions {
  prefix: string;
}

export function Controller(): ClassDecorator;
export function Controller(prefix: string): ClassDecorator;
export function Controller(options: ControllerOptions): ClassDecorator;

export function Controller(prefixOrOptions: string | ControllerOptions = '/'): ClassDecorator {
  return (target) => {
    defineMetadata(
      HTTP_PATH_PREFIX,
      typeof prefixOrOptions === 'string' ? prefixOrOptions : prefixOrOptions.prefix,
      target,
    );
    defineMetadata<true>(IS_CONTROLLER, true, target);
  };
}

function createHttpMethodDecorator(method: HTTP_METHODS) {
  return (path: string = '/') => {
    return (target, propertyKey, descriptor) => {
      if (!Reflect.hasMetadata(CONTROLLER_METHODS, target))
        Reflect.defineMetadata(CONTROLLER_METHODS, [], target);
      const controllerMethods = Reflect.getMetadata(CONTROLLER_METHODS, target) as (
        | string
        | symbol
      )[];
      controllerMethods.push(propertyKey);
      Reflect.defineMetadata(
        HTTP_METHOD_KEY,
        {
          fn: target[propertyKey],
          path,
          method,
        } satisfies HttpMethodDescription,
        target,
        propertyKey,
      );
      return descriptor;
    };
  };
}

export const Get = createHttpMethodDecorator(HTTP_METHODS.GET);

export const Post = createHttpMethodDecorator(HTTP_METHODS.POST);

export function HttpCode(code: number = 200): MethodDecorator {
  return (target, propertyKey) => {
    Reflect.defineMetadata(HTTP_CODE, code, target, propertyKey);
  };
}

export function Header(key: string, value: string): MethodDecorator {
  return (target, propertyKey) => {
    if (!Reflect.hasMetadata(HTTP_HEADER, target, propertyKey))
      Reflect.defineMetadata(HTTP_HEADER, {}, target, propertyKey);
    const headers = Reflect.getMetadata(HTTP_HEADER, target, propertyKey);
    headers[key] = value;
  };
}

export function Redirect(url: string, statusCode: number = 302): MethodDecorator {
  return (target, propertyKey) => {
    Reflect.defineMetadata(
      HTTP_REDIRECT,
      {
        url,
        statusCode,
      } satisfies HttpRedirectionDescription,
      target,
      propertyKey,
    );
  };
}
