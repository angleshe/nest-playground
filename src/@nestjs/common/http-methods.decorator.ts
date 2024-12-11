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
  safeGetMetadata,
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
      const controllerMethods = safeGetMetadata<(string | symbol)[]>(
        CONTROLLER_METHODS,
        [],
        target,
      );
      controllerMethods.push(propertyKey);
      defineMetadata<HttpMethodDescription>(
        HTTP_METHOD_KEY,
        {
          fn: target[propertyKey],
          path,
          method,
        },
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
    defineMetadata<number>(HTTP_CODE, code, target, propertyKey);
  };
}

export function Header(key: string, value: string): MethodDecorator {
  return (target, propertyKey) => {
    const headers = safeGetMetadata<Record<string, string>>(HTTP_HEADER, {}, target, propertyKey);
    headers[key] = value;
  };
}

export function Redirect(url: string, statusCode: number = 302): MethodDecorator {
  return (target, propertyKey) => {
    defineMetadata<HttpRedirectionDescription>(
      HTTP_REDIRECT,
      {
        url,
        statusCode,
      },
      target,
      propertyKey,
    );
  };
}
