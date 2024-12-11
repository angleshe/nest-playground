import { BaseRequestProPertyDecorator } from './base-request-property-decorator';
import { PARAM_KEY } from './type';

export class IpDecorator extends BaseRequestProPertyDecorator {
  override typeStr: string = 'ip';
  protected readonly requestProPertyName = 'ip';
  readonly type: symbol = PARAM_KEY.IP;
}
