import { BaseRequestProPertyDecorator } from './base-request-property-decorator';
import { PARAM_KEY } from './type';

export class HostParamDecorator extends BaseRequestProPertyDecorator {
  override typeStr: string = 'hostParam';
  protected readonly requestProPertyName = 'host';
  readonly type: symbol = PARAM_KEY.HOST_PARAM;
}
