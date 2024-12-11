import type { ResolveParamsContext } from './base-param-decorator';
import { BaseParamsDecorator } from './base-param-decorator';
import type { CustomParamDecoratorMeta } from './type';
import { PARAM_KEY } from './type';

export class CustomDecorator<T = unknown, R = unknown> extends BaseParamsDecorator<
  CustomParamDecoratorMeta<T, R>
> {
  override typeStr: string = 'custom';
  readonly type: symbol = PARAM_KEY.CUSTOM;
  override readonly isSupperPipe: boolean = true;

  resolveParams(context: ResolveParamsContext): R {
    const { args, handler } = this.meta;
    return handler(args[0], context.executionContext);
  }
}
