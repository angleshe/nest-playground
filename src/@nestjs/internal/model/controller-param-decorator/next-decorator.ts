import type { ResolveParamsContext } from './base-param-decorator';
import { BaseParamsDecorator } from './base-param-decorator';
import { PARAM_KEY } from './type';
import type { NextFunction } from 'express';

export class NextDecorator extends BaseParamsDecorator {
  override typeStr: string = 'next';
  readonly type: symbol = PARAM_KEY.NEXT;

  resolveParams(context: ResolveParamsContext): NextFunction {
    return context.next;
  }

  override checkSendRes(): boolean {
    return false;
  }
}
