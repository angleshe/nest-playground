import type { Request, Response, NextFunction } from 'express';
import type { ParamDecoratorMeta } from './type';
import type { ArgumentMetadata, ArgumentMetadataType, ArgumentsHost, Pipe } from '../../type';

export interface ResolveParamsContext {
  req: Request;
  res: Response;
  next: NextFunction;
  executionContext: ArgumentsHost;
}

export interface PipesProvider {
  getPipes(): Pipe[];
  getArgumentMetadata(): ArgumentMetadata;
}

export abstract class BaseParamsDecorator<M extends ParamDecoratorMeta = ParamDecoratorMeta>
  implements PipesProvider
{
  abstract readonly type: symbol;
  abstract readonly typeStr: string;
  protected readonly meta: M;

  readonly isSupperPipe: boolean = false;

  constructor(meta: M) {
    this.meta = meta;
  }

  abstract resolveParams(context: ResolveParamsContext): unknown;

  checkSendRes(): boolean {
    return true;
  }

  getParamsIndex() {
    return this.meta.index;
  }

  getPipes(): Pipe[] {
    return [];
  }

  getArgumentMetadata(): ArgumentMetadata {
    return {
      type: this.typeStr as ArgumentMetadataType,
      metatype: this.meta.metatype,
    };
  }
}
