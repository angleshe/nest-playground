import type { ClassConstructor, ArgumentsHost, ControllerComponentType } from '../../type';
export type ExceptionResponse = string | object;
export interface ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void;
}

export type ExceptionFilterType = ControllerComponentType<ExceptionFilter>;

export type ExceptionType = ClassConstructor;
