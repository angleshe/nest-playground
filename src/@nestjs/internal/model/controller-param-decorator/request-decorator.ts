import type { ResolveParamsContext } from './base-param-decorator';
import { BaseParamsDecorator } from './base-param-decorator';
import { PARAM_KEY } from './type';
import type { Request } from 'express';

export class RequestDecorator extends BaseParamsDecorator {
  override typeStr: string = 'request';
  readonly type: symbol = PARAM_KEY.REQUEST;

  resolveParams(context: ResolveParamsContext): Request {
    return context.req;
  }
}
