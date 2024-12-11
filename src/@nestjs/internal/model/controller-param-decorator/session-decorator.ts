import { BaseRequestProPertyDecorator } from './base-request-property-decorator';
import { PARAM_KEY } from './type';

export class SessionDecorator extends BaseRequestProPertyDecorator {
  override typeStr: string = 'session';
  protected readonly requestProPertyName = 'session';
  readonly type: symbol = PARAM_KEY.SESSION;
}
