import type { ResolveParamsContext } from './base-param-decorator';
import { BaseParamsDecorator } from './base-param-decorator';
import type { Request } from 'express';
import type { RequestProPertyParamDecoratorMeta } from './type';
import type { ArgumentMetadata, Pipe } from '../../type';

interface ArgsInfo {
  key?: string;
  pipes: Pipe[];
}

export abstract class BaseRequestProPertyDecorator<
  M extends RequestProPertyParamDecoratorMeta = RequestProPertyParamDecoratorMeta,
> extends BaseParamsDecorator<M> {
  protected abstract readonly requestProPertyName: keyof Request;

  protected readonly supperGetPropertyByArgs: boolean = false;

  private readonly argsInfo: ArgsInfo;

  constructor(meta: M) {
    super(meta);
    this.argsInfo = this.getArgsInfo();
  }

  private hasKey(args: [string, ...Pipe[]] | Pipe[]): args is [string, ...Pipe[]] {
    return typeof args[0] === 'string';
  }

  private getArgsInfo(): ArgsInfo {
    if (this.hasKey(this.meta.args)) {
      const [key, ...pipes] = this.meta.args;
      return {
        key,
        pipes,
      };
    }

    return {
      pipes: this.meta.args,
    };
  }

  resolveParams(context: ResolveParamsContext): unknown {
    const { key } = this.argsInfo;
    const res =
      this.supperGetPropertyByArgs && key
        ? context.req[this.requestProPertyName][key]
        : context.req[this.requestProPertyName];
    return res;
  }

  override getPipes(): Pipe[] {
    return this.argsInfo.pipes;
  }

  override getArgumentMetadata(): ArgumentMetadata {
    return {
      ...super.getArgumentMetadata(),
      data: this.argsInfo.key,
    };
  }
}
