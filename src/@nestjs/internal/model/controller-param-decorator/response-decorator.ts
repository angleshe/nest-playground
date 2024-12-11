import type { ResolveParamsContext } from './base-param-decorator';
import { BaseParamsDecorator } from './base-param-decorator';
import type { ResponseParamDecoratorMeta } from './type';
import { PARAM_KEY } from './type';
import type { Response } from 'express';

export class ResponseDecorator extends BaseParamsDecorator<ResponseParamDecoratorMeta> {
  override typeStr: string = 'response';
  readonly type: symbol = PARAM_KEY.RESPONSE;

  resolveParams(context: ResolveParamsContext): Response {
    return context.res;
  }

  override checkSendRes(): boolean {
    return !!this.meta.passthrough;
  }
}
