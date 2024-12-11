import { BaseRequestProPertyDecorator } from './base-request-property-decorator';
import { PARAM_KEY } from './type';

export class HeadersDecorator extends BaseRequestProPertyDecorator {
  override typeStr: string = 'headers';
  protected readonly requestProPertyName = 'header';
  readonly type = PARAM_KEY.HEADERS;
  protected override readonly supperGetPropertyByArgs: boolean = true;
}
