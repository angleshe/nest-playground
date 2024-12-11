export const HTTP_METHODS = {
  GET: 'get',
  POST: 'post',
} as const;

export type HTTP_METHODS = (typeof HTTP_METHODS)[keyof typeof HTTP_METHODS];

export const RequestMethod = {
  ...HTTP_METHODS,
  ALL: 'all',
} as const;

export type RequestMethod = (typeof RequestMethod)[keyof typeof RequestMethod];

export enum HttpStatus {
  OK = 200,
  INTERNAL = 500,
  FORBIDDEN = 403,
}

export const APP_FILTER = Symbol('appFilter');

export const APP_PIPE = Symbol('appPipe');
