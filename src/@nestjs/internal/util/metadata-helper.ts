import 'reflect-metadata';
import { ClassConstructor } from '../type';

export function getMetadata<R>(metadataKey: unknown, target: object): undefined | R;
export function getMetadata<R>(
  metadataKey: unknown,
  target: object,
  propertyKey: string | symbol | undefined,
): undefined | R;

export function getMetadata<R>(
  metadataKey: unknown,
  target: object,
  propertyKey?: string | symbol | undefined,
): undefined | R {
  return Reflect.getMetadata(metadataKey, target, propertyKey!);
}

export function safeGetMetadata<R>(metadataKey: unknown, defaultValue: R, target: object): R;
export function safeGetMetadata<R>(
  metadataKey: unknown,
  defaultValue: R,
  target: object,
  propertyKey: string | symbol | undefined,
): R;

export function safeGetMetadata<R>(
  metadataKey: unknown,
  defaultValue: R,
  target: object,
  propertyKey?: string | symbol | undefined,
): R {
  if (!Reflect.hasMetadata(metadataKey, target, propertyKey!))
    Reflect.defineMetadata(metadataKey, defaultValue, target, propertyKey!);
  return getMetadata<R>(metadataKey, target, propertyKey!)!;
}

export function defineMetadata<T = unknown>(
  metadataKey: unknown,
  metadataValue: T,
  target: object,
): void;
export function defineMetadata<T = unknown>(
  metadataKey: unknown,
  metadataValue: T,
  target: object,
  propertyKey: string | symbol | undefined,
): void;

export function defineMetadata<T = unknown>(
  metadataKey: unknown,
  metadataValue: T,
  target: object,
  propertyKey?: string | symbol | undefined,
): void {
  Reflect.defineMetadata(metadataKey, metadataValue, target, propertyKey!);
}

export function getParamTypeMeta<T = unknown>(target: object): undefined | T[];
export function getParamTypeMeta<T = unknown>(
  target: object,
  propertyKey: string | symbol | undefined,
): undefined | T[];

export function getParamTypeMeta<T = unknown>(
  target: object,
  propertyKey?: string | symbol | undefined,
) {
  return getMetadata<T>('design:paramtypes', target, propertyKey);
}

export function getTypeMeta(target: object): undefined | unknown;
export function getTypeMeta(
  target: object,
  propertyKey: string | symbol | undefined,
): undefined | unknown;

export function getTypeMeta(target: object, propertyKey?: string | symbol | undefined) {
  return getMetadata('design:type', target, propertyKey);
}

export function getReturnTypeMeta(target: object): undefined | unknown;
export function getReturnTypeMeta(
  target: object,
  propertyKey: string | symbol | undefined,
): undefined | unknown;

export function getReturnTypeMeta(target: object, propertyKey?: string | symbol | undefined) {
  return getMetadata('design:returntype', target, propertyKey);
}
